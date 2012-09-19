
/**
 * Module dependencies.
 */

var Package = require('./Package')
  , mkdir = require('mkdirp')
  , utils = require('./utils')
  , fs = require('fs')
  , path = require('path')
  , exists = fs.existsSync
  , request = require('superagent');

/**
 * Remote.
 */

var remote = 'http://50.116.26.197/components'; // TODO: settings

/**
 * Expose utils.
 */

exports.utils = utils;

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

  request.get(url, function(err, res){
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
 * Fetch readme docs for `pkg`.
 *
 * @param {String} pkg
 * @param {Function} fn
 * @api public
 */

exports.docs = function(pkg, fn){
  var url = 'https://api.github.com/repos/' + pkg + '/readme';
  request
  .get(url)
  .end(function(err, res){
    if (err) return fn(err);
    if (!res.ok) return fn();
    fn(null, res.body);
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