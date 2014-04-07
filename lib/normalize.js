
var clone = require('clone-component');
var types = require('./types');

/**
 * Normalize a component's `json`.
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

  types.forEach(function(type){
    if (ret[type]) ret._files = ret._files.concat(json[type]);
  });

  return ret;
}
