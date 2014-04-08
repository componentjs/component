
var constants = require('./constants');
var extend = require('extend');

/**
 * Normalize a component's `json`.
 *
 * TODO: make this match the spec completely
 *
 * @param {Object} json
 * @param {Boolean} dev
 * @return {Object}
 */

exports.json = function(json, dev){
  var ret = extend({}, {
    dependencies: {},
    description: '',
    development: {},
    keywords: [],
    license: '',
    locals: json.local || [],
    main: 'index.js',
    paths: [],
    repository: json.repo || ''
  }, json);

  delete ret.local;
  delete ret.repo;

  constants.types.forEach(function(type){
    ret[type] = ret[type] || [];
  });

  if (dev) {
    dev = ret.development;
    delete ret.development;
    ret = extend(ret, dev);
  }

  return ret;
}

/**
 * Normalize a component `repo` string.
 *
 * @param {String} repo
 * @return {Object}
 */

exports.repository = function(string){
  var parts = string.split('@');
  var repo = parts[0].toLowerCase();
  var version = parts[1];

  if (!~repo.indexOf('/')) {
    var err = new Error('Invalid component repository "' + string + '".');
    err.type = 'invalid_repository';
    throw err;
  }

  var pieces = repo.split('/');

  return {
    string: repo,
    owner: pieces[0],
    name: pieces[1],
    version: parts[1] || null
  };
};
