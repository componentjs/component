
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter
  , dirname = require('path').dirname
  , basename = require('path').basename
  , extname = require('path').extname
  , mkdir = require('mkdirp').mkdirp
  , request = require('superagent')
  , debug = require('debug')('component:installer')
  , Batch = require('batch')
  , fs = require('fs');

/**
 * Expose installer.
 */

module.exports = Installer;

/**
 * Initialize a new `Installer` with
 * the given `pkg` name and `dest` dir.
 *
 * @param {String} pkg
 * @param {String} dest
 * @api private
 */

function Installer(pkg, dest) {
  debug('installing %s to %s', pkg, dest);
  if (!pkg) throw new Error('pkg required');
  if (!dest) throw new Error('destination required');
  this.name = pkg;
  this.dest = dest;
  this.version = 'master';
}

/**
 * Inherit from `Emitter.prototype`.
 */

Installer.prototype.__proto__ = Emitter.prototype;

/**
 * Return URL to `file`.
 *
 * @param {String} file
 * @return {String}
 * @api private
 */

Installer.prototype.url = function(file){
  return 'https://raw.github.com/' + this.name + '/' + this.version + '/' + file;
};

/**
 * Get component.json and callback `fn(err, obj)`.
 *
 * @param {Function} fn
 * @api public
 */

Installer.prototype.getJSON = function(fn){
  var self = this;
  var url = this.url('component.json');
  request.get(url, function(res){
    if (res.ok) {
      fn(null, JSON.parse(res.text));
    } else {
      fn(new Error('failed to fetch ' + url));
    }
  });
};

Installer.prototype.getFiles = function(files){
  var self = this;
  var batch = new Batch;

  files.forEach(function(file){
    batch.push(function(done){
      var url = self.url(file);
      self.emit('file:start', file, url);
    });
  });

  batch.end();
};

/**
 * Install the component.
 *
 * @api public
 */

Installer.prototype.install = function(){
  var self = this;
  this.getJSON(function(err, json){
    if (err) return self.emit('error', err);
    var files = [];
    if (json.scripts) files = files.concat(json.scripts);
    if (json.styles) files = files.concat(json.styles);
    if (json.templates) files = files.concat(json.templates);
    self.getFiles(files);
  });
};

