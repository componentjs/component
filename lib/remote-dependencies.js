
var async = require('async');
var extend = require('extend');
var fs = require('fs-extra');
var join = require('path').join;
var spec = require('./spec');
var semver = require('semver');
var values = require('object-values');
var Ware = require('ware');

var normalize = spec.normalize;

/**
 * Expose `remote`.
 */

module.exports = remote;

/**
 * Resolve the remote dependencies for the component.
 *
 * @param {Function} fn
 * @return {Component}
 */

function remote(fn){
  var self = this;
  var dev = this.development();
  var remotes = this.remotes();
  var json = this.json();
  var conf = normalize.json(json);

  var pegs = {};
  var versions = {};
  var components = [];
  var tree = {
    type: 'root',
    name: conf.name,
    conf: conf,
    json: json
  };

  populate(tree, function(err){
    debugger;
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

    remote.versions(repo, function(err, res){
      if (err) return done(err);
      versions[repo] = res;
      pegs[repo] = pegs[repo] || {};
      pegs[repo][parent] = node.version;
      self.emit('versions', repo, res);
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

    var match = semver.maxSatisfying(versions[repo], version);
    if (!match) {
      var err = new Error('Version not found.');
      err.type = 'version_not_found';
      err.repository = repo;
      err.version = version;
      return done(err);
    }

    var range = values(pegs[repo]).join(' ') + ' ' + version;
    match = semver.maxSatisfying(versions[repo], range);
    if (!match) {
      var err = new Error('Version mismatch.');
      err.type = 'version_mismatch';
      err.repository = repo;
      err.versions = pegs[repo];
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
    if ('remote' != node.type) return setImmediate(done);
    var repo = node.repository;
    var version = node.version;
    var remote = node.remote;
    remote.json(repo, version, function(err, json){
      if (err) return done(err);
      node.json = json;
      node.conf = normalize.json(json);
      // set these so we can reliably read them later, since people forget
      json.repository = repo;
      json.version = version;
      done();
    });
  }

  /**
   * Populate the dependencies of a `node`.
   *
   * @param {Object} node
   * @param {Function} done
   */

  function getDependencies(node, done){
    var json = node.conf;
    var deps = json.dependencies;

    async.map(Object.keys(deps), dependency, function(err, nodes){
      if (err) return done(err);
      node.dependencies = nodes;
      done();
    });

    // TODO: handle locals

    function dependency(repo, finish){
      var child = {
        type: 'remote',
        parent: node.name,
        name: repo,
        repository: repo,
        version: deps[repo]
      };

      populate(child, finish);
    }
  }
}