
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
    console.error(err.stack);
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

/**
 * Log the given `type` with `msg`.
 *
 * @param {String} type
 * @param {String} msg
 * @api public
 */

function log(type, msg){
  var w = 10;
  var len = w - type.length;
  var pad = Array(len + 1).join(' ');
  console.log('  \033[36m%s\033[m : \033[90m%s\033[m', pad + type, msg);
};