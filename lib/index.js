
var async = require('async');
var clone = require('clone-component');
var Emitter = require('events').EventEmitter;
var fs = require('fs-extra');
var GitHub = require('./remote-github');
var inherit = require('util').inherits;
var install = require('./install');
var logger = require('./logger');
var normalize = require('./normalize');
var path = require('path');
var rm = require('rimraf');
var semver = require('semver');
var values = require('object-values');
var Ware = require('ware');

/**
 * Expose `Component`.
 */

module.exports = exports = Component;

/**
 * Initialize a new `Component` with a `dir`.
 *
 * @param {String} dir
 */

function Component(dir){
  if (!(this instanceof Component)) return new Component(dir);
  Emitter.call(this);

  if (!dir) {
    var err = new Error('A `directory` is required.');
    err.type = 'directory_required';
    throw err;
  }

  this.dir = dir;

  try {
    var json = require(this.path('component.json'));
  } catch (e) {
    var err = new Error('No component.json found in ' + dir);
    err.type = 'json_not_found';
    throw err;
  }

  this.json(json);
  this.buildTo('build');
  this.installTo('components');
  this.remotes([new GitHub]);
  this.development(false);
}

/**
 * Inherit from `Emitter`.
 */

inherit(Component, Emitter);

/**
 * Expose `utils`.
 */

exports.logger = logger;

/**
 * Expose `normalize` utils.
 */

exports.normalize = normalize;

/**
 * Join `paths` with the component's directory.
 *
 * @param {String} paths...
 * @return {String}
 */

Component.prototype.path = function(){
  var strs = [].slice.call(arguments);
  strs.unshift(this.dir);
  return path.join.apply(path, strs);
};

/**
 * Set the destination `dir` for built files.
 *
 * @param {String} dir
 * @return {Component}
 */

Component.prototype.buildTo = function(dir){
  if (!arguments.length) return this.path(this._buildTo);
  this._buildTo = dir;
  return this;
};

/**
 * Set the destination `dir` for installed components.
 *
 * @param {String} dir
 * @return {Component}
 */

Component.prototype.installTo = function(dir){
  if (!arguments.length) return this.path(this._installTo);
  this._installTo = dir;
  return this;
};

/**
 * Set whether to use development dependencies.
 *
 * @param {Boolean} val
 * @return {Component}
 */

Component.prototype.development = function(val){
  if (!arguments.length) return this._development;
  this._development = !! val;
  return this;
};

/**
 * Set the remotes to use for installation.
 *
 * @param {Array} remotes
 * @return {Component}
 */

Component.prototype.remotes = function(remotes){
  if (!arguments.length) return this._remotes;
  this._remotes = remotes;
  return this;
};

/**
 * Read any components that have already been installed to the component's
 * install destination folder, and callback `fn(err, components)`.
 *
 * @param {Function} fn
 */

Component.prototype.readComponents = function(fn){
  var components = [];
  var dest = this.installTo();

  fs.exists(dest, function(exists){
    if (!exists) return fn(null, components);

    fs.readdir(dest, function(err, repos){
      if (err) return fn(err);

      for (var i = 0, repo; repo = repos[i]; i++) {
        try {
          var json = require(path.join(dest, repo, 'component.json'));
          var repo = json.repository;
          components.push(json);
          components[repo] = json;
        } catch (e) {
          return fn('Invalid JSON in locally-installed "' + repo + '".');
        }
      }

      fn(null, components);
    });
  });
};

/**
 * Get or save the component.json, synchronously.
 *
 * @param {Object} json
 * @param {Function} fn
 */

Component.prototype.json = function(json){
  if (!arguments.length) return clone(this._json);
  this._json = json;
  var path = this.path('component.json');
  var pretty = JSON.stringify(json, null, 2);
  fs.writeFileSync(path, pretty);
  return this;
};

/**
 * TODO: Build the component, and callback `fn(err, res)`.
 *
 * @param {Function} fn
 * @return {Component}
 */

Component.prototype.build = require('./build');

/**
 * Install the component, and callback `fn(err, ast)`.
 *
 * @param {Function} fn
 * @return {Component}
 */

Component.prototype.install = require('./install');

/**
 * Resolve the dependencies for the component, applying remotes and semver.
 *
 * @param {Function} fn
 * @return {Component}
 */

Component.prototype.resolveComponents = require('./resolve');