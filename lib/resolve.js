
var async = require('async');
var extend = require('extend');
var fs = require('fs-extra');
var join = require('path').join;
var normalize = require('./normalize');
var semver = require('semver');
var values = require('object-values');
var Ware = require('ware');

/**
 * Expose `resolve`.
 */

module.exports = resolve;

/**
 * Resolve the dependencies for the component, applying remotes and semver.
 *
 * @param {Function} fn
 * @return {Component}
 */

function resolve(fn){
  var self = this;
  var dev = this.development();
  var remotes = this.remotes();
  var metadata = {};
  var components = [];
  var tree = {
    type: 'root',
    json: this.json()
  };

  populate(tree, function(err){
    if (err) return fn(err);
    fn(null, components);
  });

  return this;

  /**
   * Populate a `node` in the tree, then recurse through its dependencies.
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
      var data = metadata[repo] = metadata[repo] || {};
      data.pegs = data.pegs || {};
      data.pegs[parent] = node.version;
      data.versions = versions;
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
    var data = metadata[repo];
    var versions = data.versions;
    var pegs = data.pegs;

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
    components.push(node);
    components[repo] = components[repo] || {};
    components[repo] = node;
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
        node.json = normalize.json(node.json);
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
          node.json = normalize.json(json);
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
}