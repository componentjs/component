
/**
 * Module dependencies.
 */

var Installer = require('./Installer')
  , mkdir = require('mkdirp');

/**
 * Expose reporters.
 */

exports.terse = require('./reporters/terse');

/**
 * Output fatal error message and exit.
 *
 * @param {String} fmt
 * @param {Mixed} ...
 * @api private
 */

exports.fatal = function(){
  exports.error.apply(null, arguments);
  process.exit(1);
};

/**
 * Output error message.
 *
 * @param {String} fmt
 * @param {Mixed} ...
 * @api private
 */

exports.error = function(fmt){
  fmt = '\n  \033[31m' + fmt + '\033[m\n';
  console.error.apply(null, arguments);
};

/**
 * Normalize `name` string, returning an object
 * representation of what is to be installed.
 *
 * Syntax:
 *
 *    <name> ['@' version]
 *
 * @param {String} name
 * @return {Object}
 * @api private
 */

exports.parse = function(name) {
  var m = name.match(/([^:@]+)(?:@([^:]+))?/);

  return {
    name: m[1],
    version: m[2]
  }
};

/**
 * Install the given `pkg` at `version`.
 *
 * @param {String} pkg
 * @param {String} version
 * @param {Object} options
 * @api public
 */

exports.install = function(pkg, version, options){
  return new Installer(pkg, version, options);
};

/**
 * Fetch info for the given `pkg` at `version`.
 *
 * @param {String} pkg
 * @param {String} version
 * @api public
 */

exports.info = function(pkg, version, fn){
  pkg = new Installer(pkg, version);
  pkg.getJSON(fn);
};