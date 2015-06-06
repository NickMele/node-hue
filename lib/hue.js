// Load dependencies
var Promise = require('bluebird');
var Utils   = require('./utils');
var Request = Promise.promisifyAll(require("request"));

// Load modules
var Api      = require('./api');
var Discover = require('./discover');
var Lights   = require('./lights');
var Bridge   = require('./bridge');
var Debugger = require('./debugger');

// Declare internals
var internals = {
  debug: new Debugger('hue')
};

/**
 * @class Hue
 * @param {Object} settings
 * @constructor
 */
module.exports = internals.Hue = function Hue(settings) {

  internals.debug('Creating new hue instance with settings: %s', settings);

  this._discover = new Discover(this);
  internals.debug('Attached a Discover instance to the new hue instance');

  this.lights = new Lights(this);
  internals.debug('Attached a Lights instance to the new hue instance');

  // this.api = new Api(this);
  // internals.debug('Attached an Api instance to the new hue instance');

}

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
