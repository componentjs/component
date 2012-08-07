
/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , Batch = require('batch');

/**
 * Expose `Builder`.
 */

module.exports = Builder;

/**
 * Initialize a new `Builder` with the given `pkg` json object.
 *
 * @param {Object} pkg
 * @api private
 */

function Builder(pkg) {
  this.pkg = pkg;
}

/**
 * Build to `dir`.
 *
 * @param {String} dir
 * @param {Function} fn
 * @api private
 */

Builder.prototype.build = function(dir, fn){
  var batch = new Batch;
  this.dir = dir;
  batch.push(this.buildScripts.bind(this));
  batch.push(this.buildStyles.bind(this));
  batch.end(fn);
};

/**
 * Build scripts and invoke `fn(err)`.
 *
 * @param {Function} fn
 * @api private
 */

Builder.prototype.buildStyles = function(fn){
  fn();
};

/**
 * Build styles and invoke `fn(err)`.
 *
 * @param {Function} fn
 * @api private
 */

Builder.prototype.buildStyles = function(fn){
  fn();
};
