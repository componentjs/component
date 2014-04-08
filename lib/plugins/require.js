
var debug = require('debug')('component:builder:requirejs');
var requirejs = require('component-require');
var stringify = require('string-to-js');
var basename = require('path').basename;
var dirname = require('path').dirname;
var fmt = require('util').format;
var parse = require('url').parse;

/**
 * Wrap all `type` with `register()` and
 * expose `build.requirejs`.
 *
 * @return {Function}
 */

module.exports = function(type, options){
  options = options || {};
  type = type || 'scripts';
  var dev = options.dev;
  return function(build, done){
    setImmediate(done);
    var list = build.components;
    build.require = requirejs;
    build.aliases = build.aliases || '';

    list.forEach(function(conf){
      conf[type].forEach(function(file){
        var root = conf == build.components[0];
        register(type, conf, file, root, dev);
      });
    });

    list.forEach(function(conf){
      build.aliases += aliases(type, conf, list, dev);
    });
  };
};

/**
 * Register `file` of `conf` with `root` flag.
 *
 * @param {String} type
 * @param {Object} conf
 * @param {Object} file
 * @param {Boolean} root
 * @param {Boolean} dev
 * @return {Object}
 */

function register(type, conf, file, root, dev){
  var name = normalize(conf, root) + '/' + file.filename;
  var contents = file.contents;
  var js;

  if ('scripts' != type) {
    contents = 'json' == type
      ? 'module.exports = ' + contents
      : stringify(contents);
  }

  if (dev && 'scripts' == type) {
    contents = JSON.stringify(contents + '//@ sourceURL=' + name);
    js = 'require.register("%s", Function("exports, require, module",\n%s\n));\n';
  } else {
    js = 'require.register("%s", function(exports, require, module){\n%s\n});\n';
  }

  file.contents = fmt(js, name, contents);
}

/**
 * Map aliases for `conf`.
 *
 * @param {String} type
 * @param {Object} conf
 * @param {Array} list
 * @param {Boolean} dev
 * @return {String}
 */

function aliases(type, conf, list, dec){
  var basename = normalize(conf, conf == list[0]);
  var deps = dependencies(conf, list);
  var root = conf == list[0];
  var ret = [];

  deps.forEach(function(dep){
    if (!dep[type].length) return;
    var base = normalize(dep, false);
    var main = dep.main;
    var name = dep.name;

    var aliases = dep[type].map(function(file){
      var from = root
        ? conf.name + '/deps/' + name + '/' + file.filename
        : basename + '/deps/' + name + '/' + file.filename;

      return [from, base + '/' + file.filename];
    });

    if (main) {
      var from = root
        ? conf.name + '/deps/' + name + '/index.js'
        : basename + '/deps/' + name + '/index.js';

      aliases.push([from, base + '/' + main]);
    }

    if (root) {
      aliases.push([name + '/index.js', base + '/' + (dep.main || 'index.js')]);
    }

    aliases = aliases.map(alias);
    ret = ret.concat(aliases);
  });

  if (root && conf.main) {
    ret.push(alias([basename + '/index.js', basename + '/' + conf.main]));
  }

  return ret.join('\n');
}

/**
 * Alias from to with `names`.
 *
 * @param {Array} names
 * @return {String}
 */

function alias(names){
  return fmt('require.alias("%s", "%s");', names[1], names[0]);
}

/**
 * Get all dependencies of `a`.
 *
 * @param {Object} a
 * @return {Array}
 */

function dependencies(a, list){
  return list.filter(function(b){
    var slug = repo(b);
    return a.dependencies[slug];
  });
}

/**
 * Get the repo name of `conf`.
 *
 * we trust the installer to install
 * at the currect location, i have no idea
 * how this work because some components don't
 * even have `.repo` or `.repo` is incorrect:
 *
 *      github: user/lib.js
 *      json: user/lib
 *
 * @param {Object} conf
 * @return {String}
 */

function repo(conf){
  return conf.repository;
}

/**
 * Normalize `conf` name.
 *
 * @param {Object} conf
 * @param {Boolean} root
 * @return {String}
 */

function normalize(conf, root){
  return root
    ? conf.name
    : conf.repository.replace('/', '-');
}