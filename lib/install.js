
var async = require('async');
var clone = require('clone-component');
var Emitter = require('events').EventEmitter;
var extend = require('extend');
var fs = require('fs-extra');
var GitHub = require('./remote-github');
var join = require('path').join;
var semver = require('semver');
var Ware = require('ware');
var values = require('object-values');
var utils = require('./utils');

var normalizeJson = utils.normalizeJson;

/**
 * Expose `install`.
 */

module.exports = install;

/**
 * Install a component and its dependencies given a dictionary of `options`,
 * then callback `fn(err, ast)`, where `ast` is an AST of the dependencies
 * installed.
 *
 *   - Recursively retrieve each dependency's metadata.
 *   - Try to resolve semver constraints among the dependencies.
 *   - Download all of the dependencies' files.
 *
 * @param {Object} options
 *   @property {String} destination
 *   @property {Object} json
 *   @property {Array} remotes
 *   @property {Boolean} development (optional)
 * @param {Function} fn
 */

function install(options, fn){
  var dest = options.destination;
  var dev = !! options.development;
  var json = options.json;
  var remotes = options.remotes;

  var emitter = new Emitter;
  var ast = {
    type: 'root',
    json: json
  };

  Ware()
    .use(local)
    .use(tree)
    .use(components)
    .use(download)
    .run(ast, fn);

  return emitter;

  /**
   * Read any locally-installed components from the destination folder and add
   * them to the AST so that we don't make unnecessary requests.
   *
   * TODO: this logic is duplicated with Component#installed now
   *
   * @param {Object} ast
   * @param {Function} done
   */

  function local(ast, done){
    var installed = ast.installed = {};

    fs.exists(dest, function(exists){
      if (!exists) return done();
      fs.readdir(dest, function(err, repos){
        if (err) return done(err);
        async.each(repos, read, done);
      });
    });

    function read(repo, finish){
      try {
        var json = require(join(dest, repo, 'component.json'));
      } catch (e) {
        return finish('Invalid JSON in locally installed "' + repo + '".');
      }

      json = normalizeJson(json);
      installed[json.repository] = json.version;
      finish();
    }
  }

  /**
   * Populate a `node` in the tree.
   *
   * @param {Object} node
   * @param {Function} done
   */

  function tree(node, done){
    Ware()
      .use(getRemote)
      .use(getVersions)
      .use(getVersion)
      .use(getJson)
      .use(getName)
      .use(getDependencies)
      .run(node, done);
  }

  /**
   * Populate the remote of a remote `node`.
   *
   * @param {Object} node
   * @param {Function} done
   */

  function getRemote(node, done){
    if ('remote' != node.type) return setImmediate(done);
    var repo = node.repository;

    function exists(remote, finish){
      remote.exists(repo, finish);
    }

    async.detect(remotes, exists, function(remote){
      if (!remote) {
        var err = new Error('Could not find a remote for "' + repo + '".');
        err.type = 'remote_not_found';
        err.repository = repo;
        return done(err);
      }

      node.type = 'remote';
      node.remote = remote;
      emitter.emit('remote', repo, remote);
      done();
    });
  }

  /**
   * Populate the available versions of a remote `node`.
   *
   * @param {Object} node
   * @param {Function} done
   */

  function getVersions(node, done){
    if ('remote' != node.type) return setImmediate(done);
    var repo = node.repository;
    var remote = node.remote;
    var parent = node.parent;

    remote.versions(repo, function(err, versions){
      if (err) return done(err);
      var components = ast.components = ast.components || {};
      var component = ast.components[repo] = ast.components[repo] || {};
      component.pegs = component.pegs || {};
      component.pegs[parent] = node.version;
      component.versions = versions;
      emitter.emit('versions', repo, versions);
      done();
    });
  }

  /**
   * Populate the version of a remote `node`.
   *
   * @param {Object} node
   * @param {Function} done
   */

  function getVersion(node, done){
    if ('remote' != node.type) return setImmediate(done);
    var repo = node.repository;
    var version = node.version;
    var component = ast.components[repo];
    var versions = component.versions;
    var pegs = component.pegs;

    var match = semver.maxSatisfying(versions, version);
    if (!match) {
      debugger;
      var err = new Error('Version not found.');
      err.type = 'version_not_found';
      err.repository = repo;
      err.version = version;
      return done(err);
    }

    var range = values(pegs).join(' ') + ' ' + version;
    match = semver.maxSatisfying(versions, range);
    if (!match) {
      var err = new Error('Version mismatch.');
      err.type = 'version_mismatch';
      err.repository = repo;
      err.versions = pegs;
      return done(err);
    }

    node.version = match;
    component.match = node;
    done();
  }

  /**
   * Populate the json of a `node`.
   *
   * @param {Object} node
   * @param {Function} done
   */

  function getJson(node, done){
    switch (node.type) {
      case 'root':
        node._json = node.json;
        node.json = normalizeJson(node.json);
        return setImmediate(done);

      case 'local':
        return setImmedate(done);

      case 'remote':
        var repo = node.repository;
        var version = node.version;
        var remote = node.remote;
        remote.json(repo, version, function(err, json){
          if (err) return done(err);
          // set these so we can reliably read them later, since people forget
          json.repository = repo;
          json.version = version;

          node._json = json;
          node.json = normalizeJson(json);
          done();
        });
    }
  }

  /**
   * Populate the name of a `node`, which it can be referred by to the user.
   *
   * @param {Object} node
   * @param {Function} done
   */

  function getName(node, done){
    node.name = 'remote' == node.type
      ? node.repository
      : node.json.name;
    done();
  }

  /**
   * Populate the dependencies of a `node`.
   *
   * @param {Object} node
   * @param {Function} done
   */

  function getDependencies(node, done){
    var deps = {};
    var json = node.json;
    var repos = dev
      ? extend({}, json.development, json.dependencies)
      : json.dependencies;

    async.each(Object.keys(repos), dependency, function(err){
      if (err) return done(err);
      node.dependencies = deps;
      done();
    });

    function dependency(repo, finish){
      var version = repos[repo];
      var child = {
        type: 'remote',
        parent: node.name,
        repository: repo,
        version: version
      };

      tree(child, function(err, dep){
        if (err) return finish(err);
        deps[repo] = dep;
        finish();
      });
    }
  }

  /**
   * Populate the top-level `components` field of the AST with a flat version of
   * the components at the specific resolved versions from the dependency tree.
   *
   * @param {Object} ast
   * @param {Function} done
   */

  function components(ast, done){
    var comps = ast.components;

    Object.keys(comps).forEach(function(name){
      comps[name] = comps[name].match;
    });

    done();
  }

  /**
   * Download all of the files for each component in the `ast`.
   *
   * @param {Object} ast
   * @param {Function} done
   */

  function download(ast, done){
    var components = ast.components;
    var installed = ast.installed;
    var repos = Object.keys(components);

    async.each(repos, downloadRepo, done);

    function downloadRepo(repo, finish){
      var component = components[repo];
      var version = component.version;
      var json = component.json;
      var out = join(dest, repo.replace('/', '-'));

      if (installed[repo] == version) {
        emitter.emit('exists', repo, version);
        return setImmediate(finish);
      }

      emitter.emit('downloading', repo, version);

      async.each(json._files, file, function(err, res){
        if (err) return finish(err);
        var pretty = JSON.stringify(component._json, null, 2);
        fs.outputFile(join(out, 'component.json'), pretty, function(err){
          if (err) return finish(err);
          emitter.emit('download', repo, version);
          finish();
        });
      });

      function file(path, end){
        component.remote.file(path, repo, version, function(err, str){
          if (err) return end(err);
          fs.outputFile(join(out, path), str, end);
        });
      }
    }
  }
};