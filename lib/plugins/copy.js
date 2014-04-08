
var async = require('async');
var join = require('path').join;
var dirname = require('path').dirname;
var fs = require('fs-extra');
var normalize = require('../spec').normalize;

/**
 * Copy static assets of a given `type` with `options`.
 *
 * TODO: we could add mtime checking here to improve performance? and then maybe
 * enough to get rid of symlinking, since that seems to cause weird issues when
 * checked in to github?
 *
 * @param {String} type
 * @param {Object} options
 * @return {Function}
 */

module.exports = function(type, options){
  options = options || {};

  var dest = options.destination;
  var src = options.source;
  var op = options.symlink ? fs.symlink : fs.copy;

  return function(build, done){
    async.each(build.components, copy, done);

    function copy(conf, finish){
      async.each(conf[type], file, finish);

      function file(obj, end){
        var slug = normalize.repository(conf.repository).slug;
        var from = join(src, slug, obj.filename);
        var to = join(dest, slug, obj.filename);
        var dir = dirname(to);

        fs.exists(from, function(exists){
          if (!exists) {
            var err = new Error('File not found: ' + from);
            err.type = 'file_not_found';
            return end(err);
          }

          fs.mkdirp(dir, function(err){
            if (err) return end(err);
            op(from, to, end);
          });
        });
      }
    }
  };
};