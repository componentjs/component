
/**
 * Module dependencies.
 */

var exec = require('child_process').exec;
var fs = require('fs');
var assert = require('assert');
var path = require('path');
var exists = fs.existsSync || path.existsSync;

describe('component install', function(){
  beforeEach(function(done){
    exec('rm -fr components component.json', done);
  })

  beforeEach(function(done){
    fs.writeFile('component.json', JSON.stringify({
      dependencies: {
        "component/tip": "1.0.0",
        "component/popover": "1.1.0"
      },
      development: {
        "component/assert": "0.3.0"
      }
    }), done);
  })

  describe('[name]', function(){
    it('should show an error message if the component is named incorrectly', function(done) {
      exec('bin/component install component-emitter', function(err, stdout) {
        assert(err);
        done();
      })
    })

    it('should install a single component', function(done){
      exec('bin/component install component/emitter@1.0.0', function(err, stdout){
        if (err) return done(err);
        stdout.should.include('install');
        stdout.should.include('complete');
        var json = require(path.resolve('components/component/emitter/1.0.0/component.json'));
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
      exec('bin/component install component/overlay@0.1.1', function(err, stdout){
        if (err) return done(err);
        stdout.should.include('install');
        stdout.should.include('complete');
        var json = require(path.resolve('components/component/emitter/1.0.0/component.json'));
        json.name.should.equal('emitter');
        var json = require(path.resolve('components/component/overlay/0.1.1/component.json'));
        json.name.should.equal('overlay');
        done();
      })
    })

    it('should install dependencies through chain of local dependencies', function(done){
      exec('cd test/fixtures/local && ../../../bin/component install', function(err, stdout){
        if (err) return done(err);
        done();
      })
    })

    it('should download files completely', function(done){
      exec('bin/component install fortawesome/font-awesome@4.0.3', function(err, stdout){
        if (err) return done(err);
        var stats = fs.statSync(path.resolve('components/fortawesome/font-awesome/v4.0.3/fonts/fontawesome-webfont.woff'));
        stdout.should.include('install');
        stdout.should.include('complete');
        done();
      })
    })

    it('should also download json files', function (done) {
      exec('bin/component install swatinem/t@0.0.1', function(err, stdout){
        if (err) return done(err);
        var exists = fs.existsSync(path.resolve('components/swatinem/t/0.0.1/lib/definitions.json'));
        exists.should.be.true;
        stdout.should.include('install');
        stdout.should.include('complete');
        done();
      })
    })
  })

  describe('[name...]', function(){
    it('should install the multiple components', function(done){
      exec('bin/component install component/domify@1.0.0 component/dialog@0.3.0', function(err, stdout){
        if (err) return done(err);
        stdout.should.include('install');
        stdout.should.include('complete');
        var json = require(path.resolve('components/component/domify/1.0.0/component.json'));
        json.name.should.equal('domify');
        var json = require(path.resolve('components/component/dialog/0.3.0/component.json'));
        json.name.should.equal('dialog');
        done();
      })
    })
  })

  it('should default to installing from ./component.json', function(done){
    exec('bin/component install', function(err, stdout){
      if (err) return done(err);
      stdout.should.include('install');
      stdout.should.include('complete');
      var json = require(path.resolve('components/component/tip/1.0.0/component.json'));
      json.name.should.equal('tip');
      var json = require(path.resolve('components/component/popover/1.1.0/component.json'));
      json.name.should.equal('popover');
      assert(!exists('components/component/assert/0.3.0'), 'dev deps should not be installed');
      done();
    })
  })

  it('should install dev deps when --dev is used', function(done){
    exec('bin/component install -d', function(err, stdout){
      if (err) return done(err);
      stdout.should.include('install');
      stdout.should.include('complete');
      var json = require(path.resolve('components/component/tip/1.0.0/component.json'));
      json.name.should.equal('tip');
      var json = require(path.resolve('components/component/popover/1.1.0/component.json'));
      json.name.should.equal('popover');
      assert(exists('components/component/assert/0.3.0'), 'dev deps should be installed');
      done();
    })
  })

  it('should be aliased as "add"', function(done){
    exec('bin/component add component/emitter@1.0.0', function(err, stdout){
      if (err) return done(err);
      stdout.should.include('install');
      stdout.should.include('complete');
      var json = require(path.resolve('components/component/emitter/1.0.0/component.json'));
      json.name.should.equal('emitter');
      done();
    })
  })
})
