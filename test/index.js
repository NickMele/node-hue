var should = require('chai').should();
var Hue    = require('../lib');

var hue = new Hue();

describe('Hue API', function() {

  describe('Discover', function() {

    it('should perform a waterfall search on the network for the bridge(s)', function (done) {
      hue.discover().then(validateSearchResponse(done));
    });

    it('should be able to search the network via UPnP for a bridge', function(done) {
      hue.discover('upnp').then(validateSearchResponse(done));
    });

    it('should be able to search the network via N-UPnP for a bridge', function(done) {
      hue.discover('nupnp').then(validateSearchResponse(done));
    });

    it('should be able to search the network via IP scan for a bridge', function(done) {
      hue.discover('ip').then(validateSearchResponse(done));
    });

    it('should reject an invalid search method', function(done) {
      hue.discover('google').catch(function(error) {
        error.should.be.instanceOf(Error);
        done();
      });
    });

  });

  function validateSearchResponse(done) {
    return function (results) {
      results.should.be.an('array');
      done();
    };
  };

});
