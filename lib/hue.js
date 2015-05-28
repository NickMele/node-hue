// Load dependencies
var Promise = require('bluebird');
var Utils   = require('./utils');
var Request = Promise.promisifyAll(require("request"));

// Load modules
var Discover = require('./discover');
var Bridge   = require('./bridge');

// Declare internals
var internals = {};

/**
 * @class Hue
 * @param {Object} settings
 * @constructor
 */
module.exports = internals.Hue = function Hue(settings) {
  this._discover = new Discover(this);
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
  return Promise.using(discover.search(method), function(search) {
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
