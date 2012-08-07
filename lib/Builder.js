
/**
 * Module dependencies.
 */

var fs = require('fs');

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
  
};
