
/**
 * Module dependencies.
 */

var Package = require('./Package')
  , mkdir = require('mkdirp')
  , utils = require('./utils')
  , fs = require('fs')
  , path = require('path')
  , exists = fs.existsSync
  , request = require('superagent')
  , env = process.env.NODE_ENV || 'development';

/**
 * Search remote.
 */

var search = 'http://localhost:3000'; // TODO: settings

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
  var url = search + '/search/' + encodeURIComponent(query);
  request.get(url, function(err, res){
    if (err) return fn(err);
    fn(null, res.body);
  });
};