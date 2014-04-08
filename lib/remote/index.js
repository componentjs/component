
/**
 * Expose `createRemote`.
 */

module.exports = createRemote;

/**
 * Create a resolver with a given `name`.
 *
 * @param {String} name
 * @return {Function}
 */

function createRemote(name){

  /**
   * Initialize a new remote with `options`.
   *
   * TODO: cache the calls automatically for any extended remote
   *
   * @param {Object} options (optional)
   */

  function Remote(options){
    if (!(this instanceof Remote)) return new Remote(options);
    this.options = options = options || {};
    this.name = name;
  }

  /**
   * OVERIDE: Check whether a given `repo` exists.
   *
   * TODO: remove the need for this, we should just be explicit in the deps
   * instead i think. since realistically its confusing to fallback to other
   * remotes transparently if you're actually using multiple. better to just
   * explicitly say something like `private:segment/map` or something. or in
   * most cases the private will just be private repos on github that are
   * accessible from a netrc file anyways. will make install faster too
   *
   * @param {String} repo
   * @param {Function} fn
   */

  Remote.prototype.exists = function(repo, fn){
    throw new Error('Remote#exists is not implemented.');
  };

  /**
   * OVERIDE: Get all the versions for a given `repo`.
   *
   * @param {String} repo
   * @param {Function} fn
   */

  Remote.prototype.versions = function(repo, fn){
    throw new Error('Remote#versions is not implemented.');
  };

  /**
   * OVERIDE: Get a `file` for a given `repo` and `ref`.
   *
   * @param {String} file
   * @param {String} repo
   * @param {String} ref
   * @param {Function} fn
   */

  Remote.prototype.file = function(file, repo, ref, fn){
    throw new Error('Remote#file is not implemented.');
  };

  /**
   * Get the component.json for a given `repo` and `ref`.
   *
   * @param {String} repo
   * @param {String} ref
   * @param {Function} fn
   */

  Remote.prototype.json = function(repo, ref, fn){
    this.file('component.json', repo, ref, function(err, str){
      if (err) return fn(err);
      try {
        var json = JSON.parse(str);
      } catch (e) {
        return fn(new Error('invalid json in ' + repo + '@' + ref));
      }
      fn(null, json);
    });
  };

  /**
   * Return.
   */

  return Remote;
}