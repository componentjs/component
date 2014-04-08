
var clone = require('clone-component');
var Emitter = require('events').EventEmitter;
var fs = require('fs-extra');
var GitHub = require('./remote-github');
var inherit = require('util').inherits;
var path = require('path');

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
  this.symlink(true);
  this.prefix('');
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

  try {
    var pretty = JSON.stringify(json, null, 2);
  } catch (e) {
    var err = new Error('Invalid json.');
    err.type = 'invalid_json';
    throw err;
  }

  var path = this.path('component.json');
  fs.writeFileSync(path, pretty);
  this._json = json;
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
  strs.unshift(this.directory());
  return path.join.apply(path, strs);
};

/**
 * Set the destination `dir` for built files.
 *
 * @param {String} dir
 * @return {String or Component}
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
 * @return {String or Component}
 */

Component.prototype.installTo = function(dir){
  if (!arguments.length) return this.path(this._installTo);
  this._installTo = dir;
  return this;
};

/**
 * Set the remotes to use for installation.
 *
 * @param {Array} remotes
 * @return {Array or Component}
 */

Component.prototype.remotes = function(remotes){
  if (!arguments.length) return this._remotes;
  this._remotes = remotes;
  return this;
};

/**
 * Set whether to use development dependencies.
 *
 * @param {Boolean} val
 * @return {Boolean or Component}
 */

Component.prototype.development = function(val){
  if (!arguments.length) return this._development;
  this._development = !! val;
  return this;
};

/**
 * Set whether to use symlinks.
 *
 * @param {Boolean} val
 * @return {Boolean or Component}
 */

Component.prototype.symlink = function(val){
  if (!arguments.length) return this._symlink;
  this._symlink = !! val;
  return this;
};

/**
 * Set the `prefix` to rewrite CSS URLs with.
 *
 * @param {String} prefix
 * @return {String or Component}
 */

Component.prototype.prefix = function(prefix){
  if (!arguments.length) return this._prefix;
  this._prefix = prefix;
  return this;
};

/**
 * Resolve all of the locally-installed dependencies for the component, both
 * in `paths` and in the install directory.
 *
 * @param {Function} fn
 * @return {Component}
 */

Component.prototype.localDependencies = require('./local-dependencies');

/**
 * Resolve the remote dependencies for the component and for any of it's local
 * dependencies in `paths`.
 *
 * @param {Function} fn
 * @return {Component}
 */

Component.prototype.remoteDependencies = require('./remote-dependencies');

/**
 * Install the component, and callback `fn(err, components)`.
 *
 * @param {Function} fn
 * @return {Component}
 */

Component.prototype.install = require('./install');

/**
 * Build the component, and callback `fn(err, res)`.
 *
 * @param {Function} fn
 * @return {Component}
 */

Component.prototype.build = require('./build');