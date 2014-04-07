
var clone = require('clone-component');
var constants = require('./constants');

/**
 * Normalize a component's `json`.
 *
 * TODO: make this match the spec completely
 *
 * @param {Object} json
 * @return {Object}
 */

exports.json = function(json){
  var ret = clone(json);
  ret.dependencies = ret.dependencies || {};
  ret.development = ret.development || {};
  ret.local = ret.local || [];
  ret.paths = ret.paths || [];
  ret._files = ret._files || [];

  ret.repository = ret.repository || ret.repo;
  delete ret.repo;

  constants.types.forEach(function(type){
    if (ret[type]) ret._files = ret._files.concat(json[type]);
  });

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
