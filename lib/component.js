
/**
 * Module dependencies.
 */

var Package = require('./Package')
  , mkdir = require('mkdirp')
  , utils = require('./utils');

/**
 * Expose utils.
 */

exports.utils = utils;

/**
 * Expose reporters.
 */

exports.terse = require('./reporters/terse');

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