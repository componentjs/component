
/**
 * Module dependencies.
 */

var exec = require('child_process').exec
  , fs = require('fs')
  , assert = require('assert')
  , path = require('path')
  , exists = fs.existsSync || path.existsSync;

describe('component install', function(){
  beforeEach(function(done){
    exec('rm -fr components component.json', done);
  })

  beforeEach(function(done){
    fs.writeFile('component.json', JSON.stringify({
      dependencies: {
        "component/tip": "*",
        "component/popover": "*"
      },
      development: {
        "component/assert": "*"
      }
    }), done);
  })

  describe('[name]', function(){
    it('should show an error message if the component is named incorrectly', function(done) {
      exec('bin/component install component-emitter', function(err, stdout) {
        if(err) return done(err);
        stdout.should.include('install');
        done();
      })
    })

    it('should install a single component', function(done){
      exec('bin/component install component/emitter', function(err, stdout){
        if (err) return done(err);
        stdout.should.include('install');
        stdout.should.include('complete');
        var json = require(path.resolve('components/component-emitter/component.json'));
        json.name.should.equal('emitter');
        done();
      })
    })

    it('should add the component to ./component.json', function(done){
      exec('bin/component install component/emitter@0.0.4', function(err, stdout){
        if (err) return done(err);
        var json = require(path.resolve('component.json'));
        json.dependencies.should.have.property('component/emitter', '0.0.4');
        done();
      })
    })

    it('should install dependencies', function(done){
      exec('bin/component install component/overlay', function(err, stdout){
        if (err) return done(err);
        stdout.should.include('install');
        stdout.should.include('complete');
        var json = require(path.resolve('components/component-emitter/component.json'));
        json.name.should.equal('emitter');
        var json = require(path.resolve('components/component-overlay/component.json'));
        json.name.should.equal('overlay');
        done();
      })
    })
  })

  describe('[name...]', function(){
    it('should install the multiple components', function(done){
      exec('bin/component install component/overlay component/zepto', function(err, stdout){
        if (err) return done(err);
        stdout.should.include('install');
        stdout.should.include('complete');
        var json = require(path.resolve('components/component-emitter/component.json'));
        json.name.should.equal('emitter');
        var json = require(path.resolve('components/component-overlay/component.json'));
        json.name.should.equal('overlay');
        var json = require(path.resolve('components/component-zepto/component.json'));
        json.name.should.equal('zepto-component');
        done();
      })
    })
  })

  it('should default to installing from ./component.json', function(done){
    exec('bin/component install', function(err, stdout){
      if (err) return done(err);
      stdout.should.include('install');
      stdout.should.include('complete');
      var json = require(path.resolve('components/component-emitter/component.json'));
      json.name.should.equal('emitter');
      var json = require(path.resolve('components/component-tip/component.json'));
      json.name.should.equal('tip');
      var json = require(path.resolve('components/component-popover/component.json'));
      json.name.should.equal('popover');
      assert(!exists('components/component-assert'), 'dev deps should not be installed');
      done();
    })
  })

  it('should install dev deps when --dev is used', function(done){
    exec('bin/component install -d', function(err, stdout){
      if (err) return done(err);
      stdout.should.include('install');
      stdout.should.include('complete');
      var json = require(path.resolve('components/component-emitter/component.json'));
      json.name.should.equal('emitter');
      var json = require(path.resolve('components/component-tip/component.json'));
      json.name.should.equal('tip');
      var json = require(path.resolve('components/component-popover/component.json'));
      json.name.should.equal('popover');
      assert(exists('components/component-assert'), 'dev deps should be installed');
      done();
    })
  })

  it('should be aliased as "add"', function(done){
    exec('bin/component add component/emitter', function(err, stdout){
      if (err) return done(err);
      stdout.should.include('install');
      stdout.should.include('complete');
      var json = require(path.resolve('components/component-emitter/component.json'));
      json.name.should.equal('emitter');
      done();
    })
  })
})
