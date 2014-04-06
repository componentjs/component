
/**
 * Expose `errorMessage`.
 */

module.exports = errorMessage;

/**
 * Return a helpful string given an `err` object.
 *
 * @param {Error} err
 * @return {String}
 */

function errorMessage(err){
  if (!err) return null;

  switch (err.type) {
    case 'remote_not_found':
      msg = 'Could not find "' + err.repository + '".';
      break;

    case 'version_not_found':
      msg = 'Could not find a version for "' + err.repository + '".';
      break;

    case 'version_mismatch':
      var brk = '\n                 ';
      msg = 'There was a version mismatch for "' + err.repository + '":';
      msg += brk;
      msg += brk;
      msg += Object.keys(err.versions).map(function(name){
        return name + ': ' + err.repository + '@' + err.versions[name];
      }).join(brk);
      break;

    default:
      return null;
  }
}