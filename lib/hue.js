// Load dependencies
var Promise = require('bluebird');
var Utils   = require('./utils');
var Request = Promise.promisifyAll(require("request"));
var Hoek    = require('hoek');
var Kilt    = require('kilt');
var Events  = require('events');
var _       = require('lodash');
var Modelo  = require('modelo');

// Load modules
var Api      = require('./api');
var Discover = require('./discover');
var Bridge   = require('./bridge');
var Debugger = require('./debugger');

// Declare internals
var internals = {
  debug: new Debugger('hue')
};

/**
 * @class Hue
 * @param {String} username
 * @param {String} ip
 * @constructor
 */
module.exports = internals.Hue = function Hue(username, ip) {

  Hoek.assert(this.constructor === internals.Hue, 'Hue must be instantiated using new');
  Hoek.assert(username && typeof username === 'string', 'Username must be a string');
  Hoek.assert(typeof ip === 'undefined' || typeof ip === 'string', 'IP Address must be a string');

  this._events = new Kilt();
  internals.debug('Attached a Kilt instance to the new hue instance');

  this._discover = new Discover(this);
  internals.debug('Attached a Discover instance to the new hue instance');

  Bridge.call(this);

  if (!ip) {
    internals.debug('Auto discovering bridges on the network');
    this.discover().bind(this).then(function(results) {

      if (results[0] && results[0].internalipaddress) {
        internals.debug('Auto discover successful: %o', results[0]);
        this.init(results[0].internalipaddress, username);
      } else {
        // TODO: Handle no results
        internals.debug('Auto discovered failed to find a bridge');
        this._events.emit('bridge.failed', 'No bridges could be found');
      }

    });
  } else {
    internals.debug('Manually intializing the bridge with IP: %s', ip);
    this.init(ip, username);
  }

}

Modelo.inherits(internals.Hue, Bridge);

/**
 * Discovers the bridges on the network
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method  discover
 * @param   {String|Array} method can be a string to search via one method, or an array of search methods ['upnp', 'nupnp', 'ip']
 * @return  {Promise} will return a promise that will resolve with the discovered bridges
 */
internals.Hue.prototype.discover = function discover(method) {
  var discover = this._discover;
  internals.debug('Running discover using %s method', method || 'waterfall');
  return Promise.using(discover.search(method), function(search) {
    internals.debug('Search completed with the following results: %o', search);
    return Promise.resolve(search);
  });
};

/**
 * Gets the description of any bridge on the network
 * The bridge will return the description in XML form, by default this will
 * parse that into json, but can be chosen to be kept as XML
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method  description
 * @param   {String} ip the IP address of the bridge to get description information
 * @param   {Boolean} parse parse the xml data into json, by default this is set to `true`
 * @return  {Promise} will return a promise that will resolve with the parsed description
 */
internals.Hue.prototype.description = Promise.method(function description(ip, parse) {
  var endpoint = Utils.getEndpoint(ip, '/description.xml');
  return Request.getAsync(endpoint).spread(function(response, xml) {
    if (typeof parse === 'boolean' && parse === false) {
      return Promise.resolve(xml);
    } else {
      return Utils.parseXml(xml);
    }
  });
});

/**
 * Notifies when this instance is ready to be used
 *   - Bridge is found
 *
 * @method  ready
 * @return  {Promise} will return a promise that will resolve when ready to be used
 */
internals.Hue.prototype.ready = function ready() {
  return new Promise(function(resolve, reject) {
    if (this._bridgeReady) {
      return resolve();
    } else {
      this._events.on('bridge.initialized', resolve);
      this._events.on('bridge.failed', reject);
    }
  }.bind(this)).bind(this);
};
