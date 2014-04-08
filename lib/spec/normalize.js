
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

  constants.types.forEach(function(type){
    ret[type] = ret[type] || [];
  });

  if (dev) {
    dev = ret.development;
    ret = extend(ret, dev);
  }

  delete ret.local;
  delete ret.repo;
  delete ret.development;

  return ret;
}

/**
 * Normalize a component repository `string`.
 *
 * @param {String} string
 * @return {Object}
 */

exports.repository = function(string){
  if (!~string.indexOf(':')) string = 'github:' + string;
  var splitter = /(\w+):([\w-]+)\/([\w\.-]+)(?:@([v?\d\.]*\d))?/;
  var m = string.match(splitter);

  if (!m) {
    var err = new Error('Invalid repository "' + string + '".');
    err.type = 'invalid_repository';
    throw err;
  }

  m = m.slice(1);

  return {
    string: m[1] + '/' + m[2],
    slug: m[1] + '-' + m[2],
    remote: m[0],
    owner: m[1],
    name: m[2],
    version: m[3] || null
  };
};
