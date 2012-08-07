
/**
 * Module dependencies.
 */

var exec = require('child_process').exec
  , path = require('path');

describe('component-install', function(){
  beforeEach(function(done){
    exec('rm -fr components', done);
  })

  describe('[name]', function(){
    it('should install the given component', function(done){
      exec('bin/component-install component/emitter', function(err, stdout){
        if (err) return done(err);
        stdout.should.include('install');
        stdout.should.include('fetch');
        stdout.should.include('complete');
        var json = require(path.resolve('components/component-emitter/component.json'));
        json.name.should.equal('emitter');
        done();
      })
    })

    it('should install dependencies', function(done){

    })
  })

  describe('[name...]', function(){
    it('should install the given components', function(done){
      
    })
  })

  it('should default to installing from ./component.json', function(done){
    
  })
})