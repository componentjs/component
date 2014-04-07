
/**
 * TODO: everything. this file isnt done at all, still working through the
 * problems in the abstraction. changes here will probably result in changes to
 * install as well as we figure out what things work across both
 */



var async = require('async');
var spec = require('./spec');
var Ware = require('ware');
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
  var json = this.json();

  this.getComponents(function(err, installed){
    if (err) return fn(err);

    var tree = { json: json };
    var build = {};
    var components = [];

    Ware()
      .use(resolve)
      .use(plugins)
      .run(res, fn);

    populate(json, function(err){
      fn(null, components);
    });

    function populate(node, done){
      Ware()
        .use(getFiles())
        .use(getDependencies())
        .run(node, function(err, node){
          if (err) return done(err);
          components.push(node.json);
          done();
        });
    }

    function getFiles(node, done){
      var json = node.json;
      var norm = normalize.json(json);
      var repo = json.repository;

      async.each(spec.types, type, done);

      function type(name, finish){
        async.map(json[name], read, function(err, files){
          if (err) return finish(err);
          json[name] = files;
          finish();
        });
      }

      function read(file, finish){
        var path = join(install, repo, file);
        fs.readFile(path, 'utf8', function(err, str){
          finish(err, {
            filename: file,
            contents: str
          });
        });
      }
    }

    function getDependencies(node, done){
      var json = node.json;
      var deps = dev
        ? extend({}, json.dependencies, json.development)
        : json.dependencies;

      async.map(Object.keys(deps), dependency, function(err, nodes){
        if (err) return done(err);
        node.dependencies = nodes;
        done();
      });

      function dependency(name, finish){
        populate({ json: installed[name] }, finish);
      }
    }

  });

  return this;
}