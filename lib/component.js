/**
 * Module dependencies.
 */

var request = require('superagent');

var remote = 'http://50.116.26.197/components'; // TODO: settings

exports.search = function(query, fn){
  var url = query
    ? remote + '/search/' + encodeURIComponent(query)
    : remote + '/all';

  request
  .get(url)
  .set('Accept-Encoding', 'gzip')
  .end(function(err, res){
    if (err) return fn(err);
    fn(null, res.body);
  });
};
