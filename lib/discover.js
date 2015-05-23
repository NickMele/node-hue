// Load dependencies
var _ = require('lodash');
var Hoek = require('hoek');
var Async = require('Async');
var Promise = require('bluebird');

// Load hue modules
var Socket = require('./socket');

var internals = {};

/**
 * @class   Discover
 * @param   {String} type the type of search to perform. if empty the default waterfall search will be performed
 * @constructor
 */
module.exports = internals.Discover = function Discover() {

  this._methods = [
    'upnp',
    'nupnp',
    'ip'
  ];

}

/**
 * Performs a search for bridges on the network via three different methods
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method  search
 * @param   {String|Array} methods can be a string to search via one method, or an array of search methods ['upnp', 'nupnp', 'ip']
 * @return  {Promise} will return a promise that will resolve when bridge is discovered, or reject if there is an error finding the bridge
 */
internals.Discover.prototype.search = function search(methods) {

  var self = this;

  methods = methods || this._methods;

  Hoek.assert(_.isArray(methods) || _.isString(methods), '`method` must be either a string or an array.');

  return self._search = self._search || new Promise(function(resolve, reject) {

    // Create a queue that will allow use to run through our search methods
    var queue = Async.queue(function(method, done) {

      // make sure this is a valid method
      if (typeof self[method] !== 'function') {
        // reject with an error that we received an invalid method
        reject(new Error('`' + method + '` is not a valid search method.'));
        // kill the queue
        return queue.kill();
      }

      // call the method and wait for the results
      self[method]().then(function(results) {
        if (_.isArray(results) && results.length) {
          // if we got results, resolve with those results
          resolve(results);
          // make sure we kill the queue so no other methods are run
          return queue.kill();
        } else {
          // mark this method as done and move onto the next
          return done();
        }
      });

    });

    // Handle when we reach the end of the queue
    queue.drain = function() {
      return resolve([]);
    };

    // Push the search methods into the queue
    queue.push(methods);

  }).finally(function() {
    self._search = null;
  });

}

/**
 * Searches for a bridge via the UPnP method
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method upnp
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if there is an error finding the bridge
 */
internals.Discover.prototype.upnp = function upnp() {
  return new Promise(function (resolve) {
    resolve([]);
  });
}

/**
 * Searches for a bridge via the N-UPnP method
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 * https://www.meethue.com/api/nupnp
 *
 * @method nupnp
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if there is an error finding the bridge
 */
internals.Discover.prototype.nupnp = function nupnp() {
  return new Promise(function (resolve) {
    resolve([]);
  });
}

/**
 * Searches for a bridge via the IP Scan method
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method ip
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if there is an error finding the bridge
 */
internals.Discover.prototype.ip = function ip() {
  return new Promise(function (resolve) {
    resolve([]);
  });
}
