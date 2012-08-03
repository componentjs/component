
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter
  , path = require('path')
  , dirname = path.dirname
  , basename = path.basename
  , extname = path.extname
  , join = path.join
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
 * Return dirname for this package.
 * For example "component/dialog"
 * becomes "component-dialog".
 *
 * @return {String}
 * @api private
 */

Installer.prototype.dirname = function(){
  return join(this.dest, this.name.split('/').join('-'));
};

/**
 * Join `path` to this package's dirname.
 *
 * @param {String} path
 * @return {String}
 * @api private
 */

Installer.prototype.join = function(path){
  return join(this.dirname(), path);
};

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
 * Check if this component is installed.
 *
 * @param {Function} fn
 * @api private
 */

Installer.prototype.exists = function(fn){
  fs.exists(this.dirname(), fn);
};

/**
 * Get component.json and callback `fn(err, obj)`.
 *
 * @param {Function} fn
 * @api private
 */

Installer.prototype.getJSON = function(fn){
  var self = this;
  var url = this.url('component.json');
  debug('fetching %s', url);
  request.get(url, function(res){
    if (res.ok) {
      debug('got %s', url);
      fn(null, JSON.parse(res.text));
    } else {
      fn(new Error('failed to fetch ' + url));
    }
  });
};

/**
 * Fetch `files` and write them to disk and callback `fn(err)`.
 *
 * @param {Array} files
 * @param {Function} fn
 * @api private
 */

Installer.prototype.getFiles = function(files, fn){
  var self = this;
  var batch = new Batch;

  files.forEach(function(file){
    batch.push(function(done){
      var url = self.url(file);
      debug('fetching %s', url);
      self.emit('file', file, url);
      request.get(url, function(res){
        if (res.ok) {
          debug('got %s', url);
          self.writeFile(file, res.text, done);
        } else {
          done(new Error('failed to fetch ' + url));
        }
      });
    });
  });

  batch.end(fn);
};

/**
 * Write `file` with `str` contents to disk and callback `fn(err)`.
 *
 * @param {String} file
 * @param {String} str
 * @param {Function} fn
 * @api private
 */

Installer.prototype.writeFile = function(file, str, fn){
  file = this.join(file);
  debug('write %s', file);
  fs.writeFile(file, str, fn);
};

/**
 * Install `deps` and callback `fn()`.
 *
 * @param {Array} deps
 * @param {Function} fn
 * @api private
 */

Installer.prototype.getDependencies = function(deps, fn){
  var self = this;
  var batch = new Batch;

  Object.keys(deps).forEach(function(name){
    debug('dep %s', name);
    batch.push(function(done){
      var pkg = new Installer(name, self.dest);
      self.emit('dep', pkg);
      pkg.on('end', done);
      pkg.install();
    });
  });

  batch.end(fn);
};

/**
 * Check if the component exists already,
 * otherwise really ;) instally it.
 *
 * @api public
 */

Installer.prototype.install = function(){
  var self = this;
  var name = this.name;

  if (!~name.indexOf('/')) {
    return this.emit('error', new Error('invalid component name "' + name + '"'));
  }

  this.exists(function(yes){
    if (yes) {
      self.emit('exists', self);
    } else {
      self.reallyInstall();
    }
  });
};

/**
 * Really install the component.
 *
 * @api public
 */

Installer.prototype.reallyInstall = function(){
  var self = this;
  var batch = new Batch;
  this.getJSON(function(err, json){
    if (err) return self.emit('error', err);

    var files = [];
    if (json.scripts) files = files.concat(json.scripts);
    if (json.styles) files = files.concat(json.styles);
    if (json.templates) files = files.concat(json.templates);
    json.repo = json.repo || 'https://github.com/' + self.name;

    if (json.dependencies) {
      batch.push(function(done){
        self.getDependencies(json.dependencies, done);
      });
    }

    batch.push(function(done){
      // TODO: dont duplicate mkdir twice here
      mkdir(self.dirname(), function(err){
        json = JSON.stringify(json, null, 2);
        self.writeFile('component.json', json, done);
      });
    }); 

    batch.push(function(done){
      mkdir(self.dirname(), function(err){
        self.getFiles(files, done);
      });
    });

    batch.end(function(err){
      if (err) return self.emit('error', err);
      self.emit('end');
    });
  });
};
