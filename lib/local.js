
var fs = require('fs');
var path = require('path');
var spec = require('./spec');

var normalize = spec.normalize;

/**
 * Expose `local`.
 */

module.exports = local;

/**
 * Resolve all of the locally-installed dependencies for the component, both
 * in `paths` and in the install directory.
 *
 * @param {Function} fn
 */

function local(fn){
  var components = [];
  var dest = this.installTo();

  fs.exists(dest, function(exists){
    if (!exists) return fn(null, components);

    fs.readdir(dest, function(err, dirs){
      if (err) return fn(err);

      for (var i = 0, dir; dir = dirs[i]; i++) {
        try {
          var json = require(path.join(dest, dir, 'component.json'));
          var conf = normalize.json(json);
          var repo = conf.repository;
          var component = {
            type: 'remote',
            name: repo,
            repository: repo,
            version: conf.version,
            conf: conf,
            json: json
          };

          components.push(component);
          components[repo] = component;
        } catch (e) {
          return fn('Invalid JSON in locally-installed "' + dir + '".');
        }
      }

      fn(null, components);
    });
  });
}