
var async = require('async');
var fs = require('fs-extra');
var path = require('path');

/**
 * Expose `install`.
 */

module.exports = install;

/**
 * Install a component and its dependencies, then callback `fn(err, tree)`.
 *
 * @param {Function} fn
 * @return {Component}
 */

function install(fn){
  var self = this;
  var dest = this.installTo();

  this.readComponents(function(err, installed){
    if (err) return fn(err);
    self.resolveComponents(function(err, components){
      if (err) return fn(err);

      async.each(components, download, fn);

      /**
       * Download all of the files for each component.
       *
       * @param {Object} component
       * @param {Function} done
       */

      function download(component, finish){
        var version = component.version;
        var json = component.json;
        var repo = component.repository;
        var remote = component.remote;
        var out = path.join(dest, repo.replace('/', '-'));

        if (installed[repo] && installed[repo].version == version) {
          self.emit('exists', repo, version);
          return setImmediate(finish);
        }

        self.emit('downloading', repo, version);

        async.each(json._files, file, function(err, res){
          if (err) return finish(err);
          var pretty = JSON.stringify(component._json, null, 2);
          fs.outputFile(path.join(out, 'component.json'), pretty, function(err){
            if (err) return finish(err);
            self.emit('download', repo, version);
            finish();
          });
        });

        function file(filename, end){
          self.emit('downloading file', repo, version, filename);
          remote.file(filename, repo, version, function(err, str){
            if (err) return end(err);
            fs.outputFile(path.join(out, filename), str, end);
            self.emit('download file', repo, version, filename);
          });
        }
      }
    });
  });

  return this;
}