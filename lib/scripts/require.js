
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent){
  var path = require.resolve(p)
    , mod = require.modules[path];
  if (!mod) throw new Error('failed to require "' + p + '" in ' + (parent || 'root'));
  if (!mod.exports) {
    mod.exports = {};
    mod.client = true;
    mod.call(mod.exports, mod, mod.exports, require.relative(path));
  }
  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Check if a module defined at `path` exists.
 *
 * @param {String} path
 * @return {Boolean}
 * @api public
 */

require.exists = function(path){
  return !! require.modules[require.resolve(path)];
};

/**
 * Resolve `path`.
 *
 * @param {String} path
 * @return {Object} module
 * @api public
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , base = path + '/' + path + '.js'
    , index = path + '/index.js';

  return require.modules[reg] && reg
    || require.modules[index] && index
    || require.modules[base] && base
    || orig;
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api public
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Defines and executes anonymous module immediately, while preserving relative
 * paths.
 *
 * @param {String} path
 * @param {Function} require ref
 * @api public
 */

require.exec = function (path, fn) {
  fn.call(window, require.relative(path));
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  function fn(p){
    if ('.' != p[0]) return require(p, parent);
    
    var path = parent.split('/');
    var segs = p.split('/');
    path.pop();
    
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];
      if ('..' == seg) path.pop();
      else if ('.' != seg) path.push(seg);
    }

    return require(path.join('/'), parent);
  }

  fn.exists = require.exists;

  return fn;
};
