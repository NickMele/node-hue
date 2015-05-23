// Load modules
var Discover = require('./discover');
var Bridge = require('./bridge');

var internals = {};

/**
 * @class Hue
 * @param {Object} settings
 * @constructor
 */
module.exports = internals.Hue = function Hue(settings) {

  this._discover = new Discover();

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
  return this._discover.search(method);
};

/**
 * Gets the description of any bridge on the network
 * The bridge will return the description in XML form, by default this will
 * parse that into json, but can be chosen to be kept as XML
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method  description
 * @param   {String} host the IP address of the bridge to get description information
 * @param   {Boolean} parse parse the xml data into json, by default this is set to `true`
 * @return  {Promise} will return a promise that will resolve with the parsed description
 */
internals.Hue.prototype.description = function description(host, parse) {}


internals._parseUrl = function _parseUrl(url) {}
internals._parseXml = function _parseXml(xml) {}
