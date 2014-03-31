/**
 * Module dependencies.
 */

var Package = require('./Package');
var debug = require('debug')('component');
var fs = require('fs');
var path = require('path');
var join = path.join;
var exists = fs.existsSync;
var request = require('superagent');

/**
 * Remote.
 */

var remote = 'http://50.116.26.197/components'; // TODO: settings

/**
 * Lookup `pkg` within `paths`.
 *
 * @param {String} pkg
 * @param {String} paths
 * @return {String} path
 * @api private
 */

exports.lookup = function(pkg, paths){
  pkg = pkg.toLowerCase();
  debug('lookup %s', pkg);
  for (var i = 0; i < paths.length; ++i) {
    var path = join(paths[i], pkg);
    debug('check %s', join(path, 'component.json'));
    if (exists(join(path, 'component.json'))) {
      debug('found %s', path);
      return path;
    }
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
 * Search with the given `query` and callback `fn(err, components)`.
 *
 * @param {String} query
 * @param {Function} fn
 * @api public
 */

exports.search = function(query, fn){
  var url = query
    ? remote + '/search/' + encodeURIComponent(query)
    : remote + '/all';

  request
  .get(url)
  .set('Accept-Encoding', 'gzip')
  .end(function(err, res){
    if (err) return fn(err);
    fn(null, res.body);
  });
};
