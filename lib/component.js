/**
 * Module dependencies.
 */

var Package = require('./Package');
var debug = require('debug')('component');
var mkdir = require('mkdirp');
var utils = require('./utils');
var fs = require('fs');
var path = require('path');
var join = path.join;
var resolve = path.resolve;
var exists = fs.existsSync;
var request = require('superagent');

/**
 * Remote.
 */

var remote = 'http://50.116.26.197/components'; // TODO: settings

/**
 * Expose utils.
 */

exports.utils = utils;

/**
 * Lookup `pkg` within `paths`.
 *
 * @param {String} pkg
 * @param {String} paths
 * @return {String} path
 * @api private
 */

exports.lookup = function(pkg, paths){
  pkg = pkg.toLowerCase();
  debug('lookup %s', pkg);
  for (var i = 0; i < paths.length; ++i) {
    var path = join(paths[i], pkg);
    debug('check %s', join(path, 'component.json'));
    if (exists(join(path, 'component.json'))) {
      debug('found %s', path);
      return path;
    }
  }
};

/**
 * Return the dependencies of local `pkg`,
 * as one or more objects in an array,
 * since `pkg` may reference other local
 * packages as dependencies.
 *
 * @param {String} pkg
 * @param {Array} [paths]
 * @return {Array}
 * @api private
 */

exports.dependenciesOf = function(pkg, paths, parent){
  paths = paths || [];
  var path = exports.lookup(pkg, paths);
  if (!path && parent) throw new Error('failed to lookup "' + parent + '"\'s dep "' + pkg + '"');
  if (!path) throw new Error('failed to lookup "' + pkg + '"');
  var conf = require(resolve(path, 'component.json'));
  var deps = [conf.dependencies || {}];

  if (conf.local) {
    var localPaths = (conf.paths || []).map(function(depPath){
      return resolve(path, depPath);
    });

    conf.local.forEach(function(dep){
      deps = deps.concat(exports.dependenciesOf(dep, paths.concat(localPaths), pkg));
    });
  }

  return deps;
};

/**
 * Install the given `pkg` at `version`.
 *
 * @param {String} pkg
 * @param {String} version
 * @param {Object} options
 * @return {Package}
 * @api public
 */

exports.install = function(pkg, version, options){
  return new Package(pkg, version, options);
};

/**
 * Fetch info for the given `pkg` at `version`.
 *
 * @param {String} pkg
 * @param {String} version
 * @return {Package}
 * @api public
 */

exports.info = function(pkg, version, fn){
  pkg = new Package(pkg, version);
  pkg.getJSON(fn);
};

/**
 * Check if component `name` exists in ./components.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

exports.exists = function(name){
  name = name.replace('/', '-');
  var file = path.join('components', name);
  return exists(file);
};

/**
 * Search with the given `query` and callback `fn(err, components)`.
 *
 * @param {String} query
 * @param {Function} fn
 * @api public
 */

exports.search = function(query, fn){
  var url = query
    ? remote + '/search/' + encodeURIComponent(query)
    : remote + '/all';

  request
  .get(url)
  .set('Accept-Encoding', 'gzip')
  .end(function(err, res){
    if (err) return fn(err);
    fn(null, res.body);
  });
};

/**
 * Register `username` and `project`.
 *
 * @param {String} username
 * @param {String} project
 * @param {Object} json config
 * @param {Function} fn
 * @api public
 */

exports.register = function(username, project, conf, fn){
  var url = remote + '/component/' + username + '/' + project;
  request
  .post(url)
  .send(conf)
  .end(function(err, res){
    if (err) return fn(err);
    if (!res.ok) return fn(new Error('got ' + res.status + ' response ' + res.text));
    fn();
  });
};

/**
 * Fetch `pkg` changelog.
 *
 * @param {String} pkg
 * @param {Function} fn
 * @api public
 */

exports.changes = function(pkg, fn){
  // TODO: check changelog etc...
  exports.file(pkg, 'History.md', fn);
};

/**
 * Fetch `pkg`'s `file` contents.
 *
 * @param {String} pkg
 * @param {String} file
 * @param {Function} fn
 * @api public
 */

exports.file = function(pkg, file, fn){
  var url = 'https://api.github.com/repos/' + pkg + '/contents/' + file;
  request
  .get(url)
  .end(function(err, res){
    if (err) return fn(err);
    if (!res.ok) return fn();
    fn(null, res.body);
  });
};
