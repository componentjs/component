
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
  , http = require('http')
  , fs = require('fs');

/**
 * Expose installer.
 */

module.exports = Package;

/**
 * Initialize a new `Package` with
 * the given `pkg` name and `version`.
 *
 * Options:
 *
 *  - `dest` destination directory
 *  - `force` installation when previously installed
 *  - `remote` remote url defaulting to "https://raw.github.com"
 *
 * @param {String} pkg
 * @param {String} version
 * @param {Object} options
 * @api private
 */

function Package(pkg, version, options) {
  options = options || {};
  if ('*' == version) version = 'master';
  debug('installing %s@%s %j', pkg, version, options);
  if (!pkg) throw new Error('pkg required');
  if (!version) throw new Error('version required');
  this.name = pkg;
  this.dest = options.dest || 'components';
  this.remote = options.remote || 'https://raw.github.com';
  this.auth = options.auth;
  this.force = !! options.force;
  this.version = version;
}

/**
 * Inherit from `Emitter.prototype`.
 */

Package.prototype.__proto__ = Emitter.prototype;

/**
 * Return dirname for this package.
 * For example "component/dialog"
 * becomes "component-dialog".
 *
 * @return {String}
 * @api private
 */

Package.prototype.dirname = function(){
  return join(this.dest, this.name.split('/').join('-'));
};

/**
 * Join `path` to this package's dirname.
 *
 * @param {String} path
 * @return {String}
 * @api private
 */

Package.prototype.join = function(path){
  return join(this.dirname(), path);
};

/**
 * Return URL to `file`.
 *
 * @param {String} file
 * @return {String}
 * @api private
 */

Package.prototype.url = function(file){
  return this.remote + '/' + this.name + '/' + this.version + '/' + file;
};

/**
 * Conditionaly mkdir `dir` unless we've
 * already done so previously.
 *
 * @param {String} dir
 * @param {Function} fn
 * @api private
 */

Package.prototype.mkdir = function(dir, fn){
  this.dirs = this.dirs || {};
  if (this.dirs[dir]) return fn();
  mkdir(dir, fn);
};

/**
 * Get local json if the component is installed
 * and callback `fn(err, obj)`.
 *
 * @param {Function} fn
 * @api private
 */

Package.prototype.getLocalJSON = function(fn){
  fs.readFile(this.join('component.json'), 'utf8', function(err, json){
    if (err) return fn(err);
    try {
      json = JSON.parse(json);
    } catch (err) {
      return fn(err);
    }
    fn(null, json);
  });
};

/**
 * Get component.json and callback `fn(err, obj)`.
 *
 * @param {Function} fn
 * @api private
 */

Package.prototype.getJSON = function(fn){
  var self = this;
  var url = this.url('component.json');

  debug('fetching %s', url);
  var req = request.get(url);

  req.end(function(res){
    if (res.ok) {
      debug('got %s', url);
      try {
        var json = JSON.parse(res.text);
      } catch (err) {
        return fn(err);
      }
      fn(null, json);
    } else {
      fn(error(res, url));
    }
  });

  req.on('error', function(err){
    if ('getaddrinfo' == err.syscall) err.message = 'dns lookup failed';
    fn(err);
  });
};

/**
 * Fetch `files` and write them to disk and callback `fn(err)`.
 *
 * @param {Array} files
 * @param {Function} fn
 * @api private
 */

Package.prototype.getFiles = function(files, fn){
  var self = this;
  var batch = new Batch;

  files.forEach(function(file){
    batch.push(function(done){
      var url = self.url(file);
      debug('fetching %s', url);
      self.emit('file', file, url);
      var dst = self.join(file);

      // mkdir
      self.mkdir(dirname(dst), function(err){
        if (err) return fn(err);

        // pipe file
        var req = request.get(url).buffer(false);

        if (self.auth) req.auth(self.auth.user, self.auth.pass);

        req.end(function(res){
          if (res.error) return done(error(res, url));
          res.pipe(fs.createWriteStream(dst));
          res.on('error', done);
          res.on('end', done);
        });
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

Package.prototype.writeFile = function(file, str, fn){
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

Package.prototype.getDependencies = function(deps, fn){
  var self = this;
  var batch = new Batch;

  Object.keys(deps).forEach(function(name){
    var version = deps[name];
    debug('dep %s@%s', name, version);
    batch.push(function(done){
      var pkg = new Package(name, version, {
        dest: self.dest,
        force: self.force
      });
      self.emit('dep', pkg);
      pkg.on('end', done);
      pkg.on('exists', function() { done(); });
      pkg.install();
    });
  });

  batch.end(fn);
};

/**
 * Check if the component exists already,
 * otherwise install it for realllll.
 *
 * @api public
 */

Package.prototype.install = function(){
  var self = this;
  var name = this.name;

  if (!~name.indexOf('/')) {
    return this.emit('error', new Error('invalid component name "' + name + '"'));
  }

  this.getLocalJSON(function(err, json){
    if (err && err.code == 'ENOENT') {
      self.reallyInstall();
    } else if (err) {
      self.emit('error', err);
    } else if (!self.force) {
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

Package.prototype.reallyInstall = function(){
  var self = this;
  var batch = new Batch;
  this.getJSON(function(err, json){
    if (err) return self.emit('error', err);

    var files = [];
    if (json.scripts) files = files.concat(json.scripts);
    if (json.styles) files = files.concat(json.styles);
    if (json.templates) files = files.concat(json.templates);
    if (json.files) files = files.concat(json.files);
    if (json.images) files = files.concat(json.images);
    if (json.fonts) files = files.concat(json.fonts);
    json.repo = json.repo || self.remote + '/' + self.name;

    if (json.dependencies) {
      batch.push(function(done){
        self.getDependencies(json.dependencies, done);
      });
    }

    batch.push(function(done){
      self.mkdir(self.dirname(), function(err){
        json = JSON.stringify(json, null, 2);
        self.writeFile('component.json', json, done);
      });
    }); 

    batch.push(function(done){
      self.mkdir(self.dirname(), function(err){
        self.getFiles(files, done);
      });
    });

    batch.end(function(err){
      if (err) return self.emit('error', err);
      self.emit('end');
    });
  });
};

/**
 * Return an error for `res` / `url`.
 *
 * @param {Response} res
 * @param {String} url
 * @return {Error}
 * @api private
 */

function error(res, url) {
  var name = http.STATUS_CODES[res.status];
  var err = new Error('failed to fetch ' + url + ', got ' + res.status + ' "' + name + '"');
  err.status = res.status;
  return err;
}
