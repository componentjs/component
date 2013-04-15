
/**
 * Module dependencies.
 */

var exec = require('child_process').exec
  , fs = require('fs')
  , path = require('path');

describe('component info', function(){
  describe('<pkg>', function(){
    it('should fetch json', function(done){
      exec('bin/component info component/emitter', function(err, stdout){
        if (err) return done(err);
        var pkg = JSON.parse(stdout);
        pkg.name.should.equal('emitter');
        done();
      })
    })
  })

  describe('<pkg> <prop...>', function(){
    it('should filter json properties', function(done){
      exec('bin/component info component/emitter name', function(err, stdout){
        if (err) return done(err);
        stdout.should.equal('emitter');
        done();
      })
    })
  })
})
