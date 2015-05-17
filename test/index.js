var should = require('chai').should();
var Hue    = require('../lib');

var hue = new Hue({});

describe('Hue API', function() {

  describe('discover', function() {

    it('should perform a search on the network for the bridge(s)', function (done) {

      hue.discover().then(function(results, error) {
        console.log(results);
        results.should.be.an('array');
        done();
      });

    });

  });

});
