
var readNetrc = require('netrc');
var remote = require('../remote');
var superagent = require('superagent');

/**
 * Expose `GitHub`.
 */

var GitHub = module.exports = remote('github');

/**
 * Cache a netrc file.
 */

var cache;

/**
 * Check whether a given `repo` exists.
 *
 * @param {String} repo
 * @param {Function} fn
 */

GitHub.prototype.exists = function(repo, fn){
  var auth = netrc('api.github.com');
  var req = superagent
    .get('https://raw.github.com/' + repo + '/master/component.json')
    .set('User-Agent', 'component');

  if (auth) req.auth(auth.login, auth.password);

  req.end(function(err, res){
    fn(!err && !!res.ok);
  });
};

/**
 * Get all the versions for a given `repo`.
 *
 * @param {String} repo
 * @param {Function} fn
 */

GitHub.prototype.versions = function(repo, fn){
  var auth = netrc('api.github.com');
  var req = superagent
    .get('https://api.github.com/repos/' + repo + '/tags')
    .set('User-Agent', 'component');

  if (auth) req.auth(auth.login, auth.password);

  req.end(function(err, res){
    if (err) return fn(err);
    if (!res.ok) return fn(new Error('failed to get tags for ' + repo));
    fn(null, res.body.map(function(obj){
      return obj.name;
    }));
  });
};

/**
 * Get a `file` for a given `repo` and `ref`.
 *
 * @param {String} file
 * @param {String} repo
 * @param {String} ref
 * @param {Function} fn
 */

GitHub.prototype.file = function(file, repo, ref, fn){
  var auth = netrc('raw.github.com');
  var req = superagent
    .get('https://raw.github.com/' + repo + '/' + ref + '/' + file)
    .set('User-Agent', 'component');

  if (auth) req.auth(auth.login, auth.password);

  req.end(function(err, res){
    if (err) return fn(err);
    if (!res.ok) return fn(new Error('failed to get "' + file + '" for ' + repo + '@' + ref));
    fn(null, res.text);
  });
};

/**
 * Get the authentation for a given `key` in the .netrc file if one exists.
 *
 * @param {String} key
 */

function netrc(key){
  var obj = cache = cache || readNetrc();
  return obj[key] || null;
}