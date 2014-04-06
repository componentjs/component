
var clone = require('clone-component');

/**
 * Default file types.
 */

var types = [
  'files',
  'fonts',
  'images',
  'json',
  'scripts',
  'styles',
  'templates'
];

/**
 * Expose `normalize`.
 */

module.exports = normalize;

/**
 * Normalize a component's `json`.
 *
 * @param {Object} json
 * @return {Object}
 */

function normalize(json){
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
