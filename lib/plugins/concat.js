
var toFn = require('to-function');

/**
 * Concatenate the contents of all files of a `type` together and expose them
 * on the `build` object.
 *
 * @param {String} type
 * @return {Function}
 */

module.exports = function(type){
  return function(build, done){
    setImmediate(done);
    build[type] = '';
    build.components.forEach(function(conf){
      build[type] += conf[type].map(toFn('.contents')).join('\n\n');
    });
  };
};