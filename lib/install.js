
var async = require('async');
var extend = require('extend');
var fs = require('fs-extra');
var join = require('path').join;
var normalizeJson = require('./normalize').json;
var semver = require('semver');
var values = require('object-values');
var Ware = require('ware');

/**
 * Expose `install`.
 */

module.exports = install;

/**
 * Install a component and its dependencies, then callback `fn(err, tree)`.
 *
 *   - Recursively retrieve each dependency's metadata.
 *   - Try to resolve semver constraints among the dependencies.
 *   - Download all of the dependencies' files.
 *
 * @param {Function} fn
 * @return {Component}
 */

function install(fn){
  var self = this;
  var dest = this.installTo();
  var dev = this.development();
  var remotes = this.remotes();

  var tree = {
    type: 'root',
    json: this.json()
  };

  Ware()
    .use(local)
    .use(populate)
    .use(components)
    .use(download)
    .run(tree, fn);

  return this;

  /**
   * Read any locally-installed components from the destination folder and add
   * them to the tree so that we don't make unnecessary requests.
   *
   * @param {Object} tree
   * @param {Function} done
   */

  function local(tree, done){
    self.getComponents(function(err, installed){
      if (err) return done(err);
      tree.installed = installed;
      done();
    });
  }

  /**
   * Populate a `node` in the tree.
   *
   * @param {Object} node
   * @param {Function} done
   */

  function populate(node, done){
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
      self.emit('remote', repo, remote);
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
      var components = tree.components = tree.components || {};
      var component = tree.components[repo] = tree.components[repo] || {};
      component.pegs = component.pegs || {};
      component.pegs[parent] = node.version;
      component.versions = versions;
      self.emit('versions', repo, versions);
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
    var component = tree.components[repo];
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
    var json = node.json;
    var repos = dev
      ? extend({}, json.development, json.dependencies)
      : json.dependencies;

    async.map(Object.keys(repos), dependency, function(err, nodes){
      if (err) return done(err);
      node.dependencies = nodes;
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
      populate(child, finish);
    }
  }

  /**
   * Populate the top-level `components` field with a flat version
   * of the resolved components.
   *
   * @param {Object} tree
   * @param {Function} done
   */

  function components(tree, done){
    var comps = tree.components;

    Object.keys(comps).forEach(function(name){
      comps[name] = comps[name].match;
    });

    done();
  }

  /**
   * Download all of the files for each component in the `tree`.
   *
   * @param {Object} tree
   * @param {Function} done
   */

  function download(tree, done){
    var components = tree.components;
    var installed = tree.installed;
    var repos = Object.keys(components);

    async.each(repos, downloadRepo, done);

    function downloadRepo(repo, finish){
      var component = components[repo];
      var version = component.version;
      var json = component.json;
      var out = join(dest, repo.replace('/', '-'));

      debugger;

      if (installed[repo] && installed[repo].version == version) {
        debugger;
        self.emit('exists', repo, version);
        return setImmediate(finish);
      }

      self.emit('downloading', repo, version);

      async.each(json._files, file, function(err, res){
        if (err) return finish(err);
        var pretty = JSON.stringify(component._json, null, 2);
        fs.outputFile(join(out, 'component.json'), pretty, function(err){
          if (err) return finish(err);
          self.emit('download', repo, version);
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
}