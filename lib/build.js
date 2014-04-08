
/**
 * TODO: everything. this file isnt done at all, still working through the
 * problems in the abstraction. changes here will probably result in changes to
 * install as well as we figure out what things work across both
 */

var async = require('async');
var extend = require('extend');
var fs = require('fs');
var path = require('path');
var plugins = require('./plugins');
var rm = require('rimraf').sync;
var semver = require('semver');
var spec = require('./spec');
var toFn = require('to-function');
var Ware = require('ware');
var values = require('object-values');

var constants = spec.constants;
var join = path.join;
var normalize = spec.normalize;
var write = fs.writeFileSync;

/**
 * Expose `build`.
 */

module.exports = build;

/**
 * Build the component, and callback `fn(err, res)`.
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
  var symlink = this.symlink();
  var prefix = this.prefix();

  this.localDependencies(function(err, components){
    if (err) return fn(err);

    try {
      validate(components);
    } catch (e) {
      return fn(e);
    }

    /**
     * Read the files for each component.
     */

    components.unshift({ conf: normalize.json(json) });
    async.map(components, read, function(err, res){
      if (err) return fn(err);

      var options = {
        development: dev,
        destination: dest,
        prefix: prefix,
        source: install,
        symlink: symlink
      };

      Ware()
        .use(plugins.require('json', options))
        .use(plugins.require('scripts', options))
        .use(plugins.require('templates', options))
        .use(plugins.rewrite(options))
        .use(plugins.concat('json', options))
        .use(plugins.concat('scripts', options))
        .use(plugins.concat('styles', options))
        .use(plugins.concat('templates', options))
        .use(plugins.copy('fonts', options))
        .use(plugins.copy('images', options))
        .run({ components: res }, fn);
    });

    /**
     * Validate the semver in an array of `components`.
     */

    function validate(){
      var versions = pegs(normalize.json(json));

      for (var i = 0, component; component = components[i]; i++) {
        if ('remote' != component.type) return;
        var repo = component.repository;
        var version = component.version;
        var range = values(versions[repo]).join(' ');

        if (!semver.satisfies(version, range)) {
          var err = new Error('Version mismatch.');
          err.type = 'version_mismatch';
          err.repository = repo;
          err.version = versions[repo];
          throw err;
        }
      }
    }

    /**
     * Return the pegs for an array of `components`.
     *
     * @param {Object} conf
     * @return {Object}
     */

    function pegs(conf){
      var ret = {};
      var name = conf.repository || conf.name;
      var deps = conf.dependencies;

      for (var repo in deps) {
        ret[repo] = ret[repo] || {};
        ret[repo][name] = deps[repo];
        var child = components[repo].conf;
        extend(ret, pegs(child));
      }

      return ret;
    }

    /**
     * Read the files for a given `component`.
     *
     * @param {Object} component
     * @param {Function} done
     */

    function read(component, done){
      var json = component.conf;
      var repo = json.repository;

      async.each(constants.types, type, function(err){
        if (err) return done(err);
        done(null, json);
      });

      function type(name, finish){
        async.map(json[name], file, function(err, files){
          if (err) return finish(err);
          json[name] = files;
          finish();
        });
      }

      function file(name, finish){
        var parts = [];
        if (repo) {
          parts.push(install);
          parts.push(repo.replace('/', '-'));
        }
        parts.push(name);
        var filename = path.join.apply(path, parts);
        fs.readFile(filename, 'utf8', function(err, str){
          if (err) return finish(err);
          finish(null, {
            filename: name,
            contents: str
          });
        });
      }
    }

  });

  return this;
}