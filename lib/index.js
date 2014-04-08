
var async = require('async');
var clone = require('clone-component');
var Emitter = require('events').EventEmitter;
var fs = require('fs-extra');
var GitHub = require('./remote-github');
var inherit = require('util').inherits;
var install = require('./install');
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
  this.directory(dir);
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
 * Use a `plugin` function.
 *
 * @param {Function} plugin
 * @return {Component}
 */

Component.prototype.use = function(plugin){
  plugin(this);
  return this;
};

/**
 * Set the `dir` for the component.
 *
 * @param {String} dir
 * @return {String or Component}
 */

Component.prototype.directory = function(dir){
  if (!arguments.length) return this._dir;

  if (!dir) {
    var err = new Error('A `directory` is required.');
    err.type = 'directory_required';
    throw err;
  }

  this._dir = dir;
  return this;
};

/**
 * Get or save the component.json, synchronously.
 *
 * @param {Object} json
 * @return {Object or Component}
 */

Component.prototype.json = function(json){
  if (!arguments.length) {
    if (this._json) return clone(this._json);

    try {
      return require(this.path('component.json'));
    } catch (e) {
      var err = new Error('No component.json found in ' + dir);
      err.type = 'json_not_found';
      throw err;
    }
  }

  this._json = json;
  var path = this.path('component.json');
  var pretty = JSON.stringify(json, null, 2);
  fs.writeFileSync(path, pretty);
  return this;
};

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
 * Resolve all of the locally-installed dependencies for the component, both
 * in `paths` and in the install directory.
 *
 * @param {Function} fn
 * @return {Component}
 */

Component.prototype.local = require('./local');

/**
 * Resolve the remote dependencies for the component.
 *
 * @param {Function} fn
 * @return {Component}
 */

Component.prototype.remote = require('./remote');

/**
 * Install the component, and callback `fn(err, components)`.
 *
 * @param {Function} fn
 * @return {Component}
 */

Component.prototype.install = require('./install');

/**
 * TODO: Build the component, and callback `fn(err, res)`.
 *
 * @param {Function} fn
 * @return {Component}
 */

Component.prototype.build = require('./build');