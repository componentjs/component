
/**
 * Module dependencies.
 */

var exec = require('child_process').exec;
var exists = require('fs').existsSync;
var stat = require('fs').statSync;
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var vm = require('vm');

var bin = __dirname + '/../bin/component';

describe('component build', function(){
  it('should build', function(done){
    exec('cd test/fixtures/path && ' + bin + '-build', function(err, stdout){
      if (err) return done(err);

      var js = fs.readFileSync('test/fixtures/path/build/build.js', 'utf8');
      var ret = vm.runInNewContext(js);

      done();
    })
  })

  it('should exclude the js file if no scripts, and the css file if no styles', function(done){
    exec('cd test/fixtures/no-js-css && ' + bin + '-build', function(err, stdout){
      if (err) return done(err);

      assert(!exists('test/fixtures/no-js-css/build/build.js'))
      assert(!exists('test/fixtures/no-js-css/build/build.css'))
      done();
    });
  });
})
