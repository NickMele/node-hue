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
internals.Discover.prototype.search = Promise.method(function search(methods) {

  var self = this;

  methods = methods || this._methods;

  Hoek.assert(_.isArray(methods) || _.isString(methods), '`method` must be either a string or an array.');

  if (_.isString(methods)) { methods = [methods]; }

  return self._search = self._search || Promise.any(methods.map(function(method) {
    if (typeof self[method] !== 'function') {
      throw new Error('`' + method + '` is not a valid search method.');
    } else {
      return self[method]();
    }
  })).finally(function() {
    self._search = null;
  }).catch(function() {
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
  return new Promise(function (resolve, reject) {
    reject();
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
    resolve(['127.0.0.1']);
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
  return new Promise(function (resolve, reject) {
    reject();
  });
}
