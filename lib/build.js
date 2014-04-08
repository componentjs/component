
/**
 * TODO: everything. this file isnt done at all, still working through the
 * problems in the abstraction. changes here will probably result in changes to
 * install as well as we figure out what things work across both
 */

var async = require('async');
var path = require('path');
var spec = require('./spec');
var toFn = require('to-function');
var Ware = require('ware');
var values = require('object-values');

var normalize = spec.normalize;

/**
 * Expose `build`.
 */

module.exports = build;

/**
 * Build a component and its dependencies given a dictionary of `options`, then
 * callback `fn(err, res)`, where `res` is an object of the built contents.
 *
 *   - Read the components from the install directory.
 *   - Read all of the files for each component.
 *   -
 *
 *
 * @param {Function} fn
 * @return {Component}
 */

function build(fn){
  var self = this;
  var install = this.installTo();
  var dest = this.buildTo();
  var dev = this.development();
  var plugins = [];

  this.localDependencies(function(err, components){
    if (err) return fn(err);

    /**
     * Populate the `pegs` for each component.
     */

    var pegs = components.reduce(function(memo, component){
      var name = component.name;
      var deps = component.conf.dependencies;
      for (var repo in deps) memo[repo][name] = deps[repo];
    }, {});

    /**
     * Assert that each remote component satisfies semver for its pegs.
     */

    for (var i = 0, component; component = components[i]; i++) {
      if ('remote' != component.type) return;
      var repo = component.repository;
      var version = component.version;
      var range = values(pegs[repo]).join(' ');
      if (!semver.satisfies(version, range)) {
        var err = new Error('Version mismatch.');
        err.type = 'version_mismatch';
        err.repository = repo;
        err.version = pegs[repo];
        return fn(err);
      }
    }

    /**
     * Read the files for each component.
     */

    async.map(components, read, function(err, res){
      Ware()
        .use(plugins)
        .run({ components: res.map(toFn('.conf')) }, fn);
    });
  });

  /**
   * Read the files for a given `component`.
   *
   * @param {Object} component
   * @param {Function} done
   */

  function read(component, done){
    var json = component.conf;
    var repo = json.repository;

    async.each(spec.types, type, done);

    function type(name, finish){
      async.map(json[name], file, function(err, files){
        if (err) return finish(err);
        json[name] = files;
        finish();
      });
    }

    function file(name, finish){
      var filename = path.join(install, repo, name);
      fs.readFile(filename, 'utf8', function(err, str){
        finish(err, {
          filename: file,
          contents: str
        });
      });
    }
  }

  return this;
}