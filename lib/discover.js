// Load dependencies
var _ = require('lodash');
var Promise = require('bluebird');
var Hoek = require('hoek');
var Async = require('Async');
var Request = Promise.promisifyAll(require("request"));

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

  var promises = methods.map(function(method) {
    if (typeof self[method] !== 'function') {
      throw new Error('`' + method + '` is not a valid search method.');
    } else {
      return self[method]().cancellable();
    }
  });

  self._search = Promise.any(promises);

  self._search = self._search.then(function(results) {
    return _.uniq(results);
  });

  self._search = self._search.map(function(ip) {
    return self._hue.description(ip).then(function(description) {
      return Promise.resolve({
        id: description && description.device && description.device.serialNumber,
        internalipaddress: ip
      });
    });
  });

  self._search = self._search.catch(TypeError, ReferenceError, function(error) {
    // output any developer error so we don't stifle them
  }).catch(function(error) {
    // any other type of error will just result in no bridges being found
    return Promise.resolve([]);
  });

  self._search = self._search.disposer(function() {
    _.each(promises, function(promise, index) {
      if (promise.isCancellable()) {
        promise.cancel();
      }
    });
    self._search = null;
  });

  return self._search;

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
  return Request.getAsync('https://www.meethue.com/api/nupnp', {
    json: true
  }).spread(function(response, json) {
    return Promise.map(json, function(bridge) {
      return bridge.internalipaddress;
    });
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
  return Promise.reject();
}

/**
 * Returns the search, along with a disposer method that will cleanup the search when done
 *
 * @method  getSearch
 * @return  {Promise} will return a promise that resolves to the search created
 */
internals.Discover.prototype.getSearch = Promise.method(function getSearch() {

  var search = this._search;

  return Promise.resolve(search).disposer(function(search) {
    if (search) {
      search = null;
    }
  });
});
