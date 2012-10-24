
/**
 * Module dependencies.
 */

var exec = require('child_process').exec
  , bin = __dirname + '/../bin/component'
  , path = require('path')
  , fs = require('fs')
  , vm = require('vm')

describe('component build', function(){
  describe('when COMPONENT_PATH is set', function(){
    it('should build', function(done){
      exec('cd test/fixtures/path && COMPONENT_PATH=lib ' + bin + '-build -v', function(err, stdout){
        if (err) return done(err);
        stdout.should.include('build/build.js');
        stdout.should.include('duration');
        stdout.should.include('css');
        stdout.should.include('js');

        var js = fs.readFileSync('test/fixtures/path/build/build.js', 'utf8');
        var ret = vm.runInNewContext(js + '; require("foo")');
        ret.should.equal('baz');

        var ret = vm.runInNewContext(js + '; require("baz")');
        ret.should.equal('baz');

        done();
      })
    })
  })

  describe('when COMPONENT_PATH is omitted', function(){
    it('should fail', function(done){
      exec('cd test/fixtures/path && ' + bin + '-build -v', function(err, stdout, stderr){
        stderr.should.include('error');
        stderr.should.include('failed to lookup dependency "bar"');
        done();
      })
    })
  })
})