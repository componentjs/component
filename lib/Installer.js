
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter
  , dirname = require('path').dirname
  , basename = require('path').basename
  , extname = require('path').extname
  , mkdir = require('mkdirp').mkdirp
  , request = require('superagent')
  , debug = require('debug')('component:installer')
  , fs = require('fs');

/**
 * Expose installer.
 */

module.exports = Installer;

/**
 * Initialize a new `Installer` with
 * the given `pkg` name and `dest` dir.
 *
 * @param {String} pkg
 * @param {String} dest
 * @api private
 */

function Installer(pkg, dest) {
  debug('installing %s to %s', pkg, dest);
  if (!pkg) throw new Error('pkg required');
  if (!dest) throw new Error('destination required');
  this.pkg = pkg;
  this.dest = dest;
}

/**
 * Inherit from `Emitter.prototype`.
 */

Installer.prototype.__proto__ = Emitter.prototype;


