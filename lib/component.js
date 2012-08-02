
/**
 * Module dependencies.
 */

var Installer = require('./Installer')
  , mkdir = require('mkdirp');

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
 * Log the given `type` with `msg`.
 *
 * @param {String} type
 * @param {String} msg
 * @api public
 */

exports.log = function(type, msg){
  var w = 10;
  var len = w - type.length;
  var pad = Array(len + 1).join(' ');
  console.log('  \033[36m%s\033[m : \033[90m%s\033[m', pad + type, msg);
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
 * Install the given `pkg` to `dest`.
 *
 * @param {String} pkg
 * @param {String} dest
 * @api public
 */

exports.install = function(pkg, dest){
  return new Installer(pkg, dest);
};