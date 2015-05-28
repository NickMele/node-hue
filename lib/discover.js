// Load dependencies
var _       = require('lodash');
var Promise = require('bluebird');
var Hoek    = require('hoek');
var Async   = require('Async');
var Request = Promise.promisifyAll(require("request"));

// Load hue modules
var Socket = require('./socket');
var Debugger = require('./debugger');

var internals = {
  debug: new Debugger('discover')
};

/**
 * @class   Discover
 * @param   {Object} hue instance of Hue class
 * @constructor
 */
module.exports = internals.Discover = function Discover(hue) {

  internals.debug('Creating new Discover instance');

  this._hue = hue;
  this._methods = [
    'upnp',
    'nupnp',
    'ip'
  ];

  internals.debug('Default methods for Discover are: %o', this._methods);

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

  internals.debug('Beginning a search using: %o', methods);

  Hoek.assert(_.isArray(methods) || _.isString(methods), '`method` must be either a string or an array.');

  if (_.isString(methods)) {
    methods = [methods];
    internals.debug('Converting methods string into array: %o', methods);
  }

  var promises = methods.map(function(method) {
    if (typeof self[method] !== 'function') {
      internals.debug('%s is not a valid search method', method);
      throw new Error('`' + method + '` is not a valid search method.');
    } else {
      internals.debug('Executing %s search method', method);
      return self[method]().cancellable();
    }
  });

  internals.debug('Starting a race between all provided methods');
  self._search = Promise.any(promises);

  self._search = self._search.then(function(results) {
    internals.debug('Initial results returned, removing duplicates: %o', results);
    return _.uniq(results);
  });

  self._search = self._search.map(function(ip) {
    internals.debug('Fetching description data for %s', ip);
    return self._hue.description(ip).then(function(description) {
      var id = description && description.device && description.device.serialNumber;
      internals.debug('Description data found, resolving with id and ip: %s, %s', id, ip);
      return Promise.resolve({
        id: id,
        internalipaddress: ip
      });
    });
  });

  self._search = self._search.catch(TypeError, ReferenceError, function(error) {
    // output any developer error so we don't stifle them
    internals.debug('We have encountered a developer error: %s', error.type);
    console.error(error);
  }).catch(function(error) {
    internals.debug('The search failed, resolving with an empty array');
    // any other type of error will just result in no bridges being found
    return Promise.resolve([]);
  });

  self._search = self._search.disposer(function() {
    internals.debug('Disposing of this search to prevent memory leaks');
    _.each(promises, function(promise, index) {
      if (promise.isCancellable()) {
        internals.debug('Cancelling the %s search', methods[index]);
        promise.cancel();
      }
    });
    internals.debug('Clearing out the search');
    self._search = null;
  });

  internals.debug('Returning a promise that we will have results');
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

  internals.debug('Creating a new socket to perform a upnp search');
  var socket = new Socket();

  return socket.send([
    'M-SEARCH * HTTP/1.1',
    'HOST: 239.255.255.250:1900',
    'MAN: ssdp:discover',
    'MX: 10',
    'ST: ssdp:all'
  ], 1900, "239.255.255.250", 5000).filter(function(messages) {
    internals.debug('Message received on socket, checking if its a hue bridge: %o', messages);
    return /IpBridge/.test(messages.message);
  }).map(function(message) {
    internals.debug('Message matched a hue bridge', message.rinfo.address);
    return message.rinfo.address;
  }).catch(function(error) {
    internals.debug('Error on socket %s', error.type);
    console.error(error);
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
  internals.debug('Sending request to https://www.meethue.com/api/nupnp to find bridges');
  return Request.getAsync('https://www.meethue.com/api/nupnp', {
    json: true
  }).spread(function(response, json) {
    internals.debug('Data returned from request: %o', json);
    return Promise.map(json, function(bridge) {
      internals.debug('Returning just the ip address: %s', bridge.internalipaddress);
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
