
var async = require('async');
var fs = require('fs-extra');
var path = require('path');
var constants = require('./spec').constants;

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

  this.localDependencies(function(err, locals){
    if (err) return fn(err);
    self.remoteDependencies(function(err, remotes){
      if (err) return fn(err);
      async.each(remotes, download, fn);

      /**
       * Download all of the files for each component.
       *
       * @param {Object} component
       * @param {Function} done
       */

      function download(component, finish){
        var version = component.version;
        var json = component.conf;
        var repo = component.repository;
        var remote = component.remote;
        var out = path.join(dest, repo.replace('/', '-'));

        if (locals[repo] && locals[repo].version == version) {
          self.emit('exists', repo, version);
          return setImmediate(finish);
        }

        self.emit('downloading', repo, version);

        var files = constants.types.reduce(function(arr, type){
          return arr.concat(json[type]);
        }, []);

        async.each(files, file, function(err, res){
          if (err) return finish(err);
          var pretty = JSON.stringify(component.json, null, 2);
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