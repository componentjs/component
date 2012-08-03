
/**
 * Module dependencies.
 */

var utils = require('../utils')
  , log = utils.log;

/**
 * Expose `terse`.
 */

module.exports = terse;

/**
 * Terse reporting for `pkg`.
 *
 * @param {Installer} install
 * @api private
 */

function terse(pkg){
  log('install', pkg.name + '@' + pkg.version);

  pkg.on('error', function(err){
    log('error', err.message);
    process.exit(1);
  });

  pkg.on('dep', function(dep){
    log('dep', dep.name + '@' + dep.version);
    terse(dep);
  });

  pkg.on('exists', function(dep){
    log('exists', dep.name + '@' + dep.version);
  });

  pkg.on('file', function(file){
    log('fetch', pkg.name + ':' + file);
  });

  pkg.on('end', function(){
    log('complete', pkg.name);
  });
};
