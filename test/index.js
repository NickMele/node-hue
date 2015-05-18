var should = require('chai').should();
var Hue    = require('../lib');

var hue = new Hue({
  autoDiscover: false
});

describe('Hue API', function() {

  describe('Discover', function() {

    it('should perform a search on the network for the bridge(s)', function (done) {
      hue.discover().then(validateSearchResponse(done));
    });

  });

  describe('UPnP Search', function() {

    it('should be able to search the network via UPnP for a bridge', function(done) {
      hue._upnpSearch().then(validateSearchResponse(done));
    });

  });

  describe('N-UPnP Search', function() {

    it('should be able to search the network via N-UPnP for a bridge', function(done) {
      hue._nupnpSearch().then(validateSearchResponse(done));
    });

  });

  function validateSearchResponse(done) {
    return function (results) {
      results.should.be.an('array')
        .with.deep.property('[0]')
        .that.includes.keys('id', 'internalipaddress');
      done();
    };
  };

});
