
/**
 * Module dependencies.
 */

var Package = require('./Package')
  , mkdir = require('mkdirp');

/**
 * Expose reporters.
 */

exports.terse = require('./reporters/terse');

/**
 * Output fatal error message and exit.
 *
 * @param {String} msg
 * @api private
 */

exports.fatal = function(){
  console.error();
  exports.error.apply(null, arguments);
  console.error();
  process.exit(1);
};

/**
 * Output error message.
 *
 * @param {String} msg
 * @api private
 */

exports.error = function(msg){
  exports.log('error', msg);
};

/**
 * Log the given `type` with `msg`.
 *
 * @param {String} type
 * @param {String} msg
 * @api public
 */

exports.log = function(type, msg){
  var w = 15;
  var len = Math.max(0, w - type.length);
  var pad = Array(len + 1).join(' ');
  if ('error' == type) {
    console.error('  \033[31m%s\033[m : \033[90m%s\033[m', pad + type, msg);
  } else {
    console.log('  \033[36m%s\033[m : \033[90m%s\033[m', pad + type, msg);
  }
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