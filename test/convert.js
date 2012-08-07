
/**
 * Module dependencies.
 */

var exec = require('child_process').exec
  , fs = require('fs')
  , path = require('path');

describe('component convert', function(){
  describe('<file>', function(){
    it('should convert the html to a require()-able js file', function(done){
      exec('bin/component convert test/fixtures/tip.html', function(err, stdout){
        if (err) return done(err);
        var file = path.resolve('test/fixtures/tip');
        var ret = require(file);
        var html = fs.readFileSync(file + '.html', 'utf8');
        ret.should.equal(html);
        done();
      })
    })
  })
})