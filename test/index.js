var Hue = require('../lib');

var hue = new Hue();

describe('Hue API', function() {

  describe('Discover', function() {

    it('should perform a waterfall search on the network for the bridge(s)', function () {
      return hue.discover().should.eventually.be.an('array');
    });

    it('should be able to search the network via UPnP for a bridge', function() {
      return hue.discover('upnp').should.eventually.be.an('array');
    });

    it('should be able to search the network via N-UPnP for a bridge', function() {
      return hue.discover('nupnp').should.eventually.be.an('array');
    });

    it('should be able to search the network via IP scan for a bridge', function() {
      return hue.discover('ip').should.eventually.be.an('array');
    });

    it('should reject an invalid search method', function() {
      return hue.discover('google').should.eventually.be.rejectedWith(Error, '`google` is not a valid search method.');
    });

  });

});
