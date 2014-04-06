
/**
 * TODO: Refactor the padding logic to be dryer.
 */

/**
 * Log the given `type` with `msg`.
 *
 * @param {String} type
 * @param {String} msg
 * @api public
 */

exports.log = function(type, msg, color){
  color = color || '36';
  var w = 10;
  var len = Math.max(0, w - type.length);
  var pad = Array(len + 1).join(' ');
  console.log('  \033[' + color + 'm%s\033[m : \033[90m%s\033[m', pad + type, msg);
};

/**
 * Log warning message with `type` and `msg`.
 *
 * @param {String} type
 * @param {String} msg
 * @api public
 */

exports.warn = function(type, msg){
  exports.log(type, msg, '33');
};

/**
 * Output error message.
 *
 * @param {String} msg
 * @api private
 */

exports.error = function(msg){
  var w = 10;
  var type = 'error';
  var len = Math.max(0, w - type.length);
  var pad = Array(len + 1).join(' ');
  console.error('  \033[31m%s\033[m : \033[90m%s\033[m', pad + type, msg);
};

/**
 * Output fatal error message and exit.
 *
 * @param {String} msg
 * @api private
 */

exports.fatal = function(msg){
  if (msg instanceof Error) msg = message(msg);
  console.error();
  exports.error(msg);
  console.error();
  process.exit(1);
};

/**
 * Return a helpful string for one of the known error types given an `err`.
 *
 * @param {Error} err
 * @return {String}
 */

function message(err){
  switch (err.type) {
    case 'directory_required':
      msg = 'You must initialize a component with a directory.';
      break;

    case 'json_not_found':
      msg = 'There is no component.json in this directory.';
      break;

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
      return err.message;
  }
}