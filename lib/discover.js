// Load dependencies
var _ = require('lodash');
var Promise = require('bluebird');
var Hoek = require('hoek');
var Async = require('Async');

// Load hue modules
var Socket = require('./socket');

var internals = {};

/**
 * @class   Discover
 * @param   {Object} hue instance of Hue class
 * @constructor
 */
module.exports = internals.Discover = function Discover(hue) {

  this._hue = hue;
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
internals.Discover.prototype.search = Promise.method(function search(methods) {

  var self = this;

  methods = methods || this._methods;

  Hoek.assert(_.isArray(methods) || _.isString(methods), '`method` must be either a string or an array.');

  if (_.isString(methods)) {
    methods = [methods];
  }

  return self._search = self._search || Promise.any(methods.map(function(method) {

    if (typeof self[method] !== 'function') {
      throw new Error('`' + method + '` is not a valid search method.');
    } else {
      return self[method]();
    }

  })).map(self._hue.description).finally(function() {

    // Make sure we don't keep this search so a new one can be started
    self._search = null;

  }).catch(TypeError, ReferenceError, function(error) {

    // output any developer error so we don't stifle them
    console.log(error);

  }).catch(function(error) {

    // any other type of error will just result in no bridges being found
    return Promise.resolve([]);

  });

});

/**
 * Searches for a bridge via the UPnP method
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method upnp
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if there is an error finding the bridge
 */
internals.Discover.prototype.upnp = function upnp() {

  var socket = new Socket();

  return socket.send([
    'M-SEARCH * HTTP/1.1',
    'HOST: 239.255.255.250:1900',
    'MAN: ssdp:discover',
    'MX: 10',
    'ST: ssdp:all'
  ], 1900, "239.255.255.250", 5000).filter(function(messages) {
    return /IpBridge/.test(messages.message);
  }).map(function(messages) {
    return messages.rinfo.address;
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
  return Promise.reject();
}

/**
 * Searches for a bridge via the IP Scan method
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method ip
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if there is an error finding the bridge
 */
internals.Discover.prototype.ip = function ip() {
  return Promise.reject();
}
