
var async = require('async');
var fs = require('fs-extra');
var GitHub = require('./remote-github');
var install = require('./install');
var join = require('path').join;
var utils = require('./utils');
var rm = require('rimraf');

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
  if (!dir) {
    var err = new Error('A `directory` is required.');
    err.type = 'directory_required';
    throw err;
  }

  this.dir = dir;
  this.buildTo('build');
  this.installTo('components');
  this.remotes([new GitHub]);
  this.development(false);

  try {
    this.json = require(join(dir, 'component.json'));
  } catch (e) {
    var err = new Error('No component.json found in ' + dir);
    err.type = 'json_not_found';
    throw err;
  }
}

/**
 * Expose `utils`.
 */

exports.utils = utils;

/**
 * Set the destination `dir` for built files.
 *
 * @param {String} dir
 * @return {Component}
 */

Component.prototype.buildTo = function(dir){
  this._buildTo = dir;
  return this;
};

/**
 * Set the destination `dir` for components.
 *
 * @param {String} dir
 * @return {Component}
 */

Component.prototype.installTo = function(dir){
  this._installTo = dir;
  return this;
};

/**
 * Set the remotes to use for installation.
 *
 * @param {Array} remotes
 * @return {Component}
 */

Component.prototype.remotes = function(remotes){
  this._remotes = remotes;
  return this;
};

/**
 * Enable installing development dependencies.
 *
 * @return {Component}
 */

Component.prototype.development = function(){
  this._development = true;
  return this;
};

/**
 * Get the currently installed dependencies.
 *
 * @param {Function} fn
 */

Component.prototype.installed = function(fn){
  var installed = {};
  var dest = join(this.dir, this._installTo);

  fs.exists(dest, function(exists){
    if (!exists) return finish();
    fs.readdir(dest, function(err, repos){
      if (err) return finish(err);
      // TODO: doesnt need to be async
      async.each(repos, read, finish);
    });
  });

  function read(repo, done){
    try {
      var json = require(join(dest, repo, 'component.json'));
      installed[json.repository] = json;
    } catch (e) {
      return done('Invalid JSON in locally installed "' + repo + '".');
    }
    done();
  }

  function finish(err){
    if (err) return fn(err);
    fn(null, installed);
  }
};

/**
 * Save the current JSON.
 *
 * @param {Function} fn
 */

Component.prototype.save = function(json, fn){
  this.json = json;
  var path = join(this.dir, 'component.json');
  var pretty = JSON.stringify(json, null, 2);
  fs.writeFile(path, pretty, fn);
};

/**
 * Install the component, and callback `fn(err, ast)`.
 *
 * @param {Function} fn
 */

Component.prototype.install = function(fn){
  var dest = join(this.dir, this._installTo);
  var options = {
    destination: dest,
    development: this._development,
    json: this.json,
    remotes: this._remotes
  };

  return install(options, fn);
};

/**
 * TODO: Build the component, and callback `fn(err, res)`.
 *
 * @param {Function} fn
 */

Component.prototype.build = function(fn){
  fn();
};