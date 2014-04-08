
var basename = require('path').basename;
var dirname = require('path').dirname;
var resolve = require('url').resolve;

/**
 * Expose `rewriteUrls`
 */

module.exports = rewriteUrls;

/**
 * URL matcher.
 */

var matcher = /\burl *\(([^)]+)\)/g;

/**
 * Rewrite CSS URLs given `options`.
 *
 * @param {Object} options
 *   @property {String} prefix
 * @return {Function}
 */

function rewriteUrls(options){
  options = options || {};

  var prefix = options.prefix;

  return function(build, done){
    setImmediate(done);
    build.components.forEach(function(conf, i){
      conf.styles.forEach(function(file){
        var name = i
          ? conf.repository.replace('/', '-')
          : conf.name;
        file.contents = rewrite(file, name, prefix);
      });
    });
  };
}

/**
 * Rewrite urls of `file` with `basename`, `prefix`.
 *
 * @param {Object} file
 * @param {String} basename
 * @param {String} prefix
 * @return {Object}
 */

function rewrite(file, basename, prefix){
  return file.contents.replace(matcher, function(_, url){
    var orig = 'url(' + url + ')';
    if (data(url)) return orig;
    if (absolute(url)) return orig;
    var dir = dirname(file.filename);
    url = stripQuotes(url);
    var dir = [prefix, basename, dir].filter(truthy).join('/') + '/';
    return 'url("' + resolve(dir, url) + '")';
  });
}

/**
 * Normalize conf name.
 *
 * @param {Object} conf
 * @param {Array} list
 * @return {String}
 */

function normalize(conf, list){
  return conf == list[0]
    ? conf.name
    : basename(conf.path());
}

/**
 * Truthy filter.
 *
 * @param {String} val
 * @return {Boolean}
 */

function truthy(val){
  return !! val;
}

/**
 * Check if a `url` is a data URL.
 *
 * @param {String} url
 * @return {Boolean}
 */

function data(url){
  return 0 == url.indexOf('data:');
}

/**
 * Check if a `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 */

function absolute(url){
  return ~url.indexOf('://')
    || '/' == url[0];
}

/**
 * Strip quotes.
 *
 * @param {String} str
 * @return {String}
 */

function stripQuotes(str){
  if (/^'"/.test(str)) return str.slice(1, -1);
  return str;
}