// Load dependencies
var _ = require('lodash');
var Promise = require('bluebird');
var Url = require('url');
var Request = Promise.promisifyAll(require("request"));
var Xml2js = Promise.promisifyAll(require("xml2js"));

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
    return search;
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
internals.Hue.prototype.description = function description(ip, parse) {
  var endpoint = internals._getEndpoint(ip, '/description.xml');
  return Request.getAsync(endpoint).spread(function(response, xml) {
    if (_.isBoolean(parse) && parse === false) {
      return Promise.resolve(xml);
    } else {
      return internals._parseXml(xml);
    }
  });
}


internals._getEndpoint = function _getEndpoint(ip, path) {
  // check if we were given just the host, or a real url
  if (!/^https|^\/\//.test(ip)) {
    ip = 'http://' + ip;
  }
  // parse the url
  var parsed = Url.parse(ip);
  // modify the path to point to config
  parsed.pathname = path || '/';
  // format the parsed url back into a string
  return Url.format(parsed);
}

internals._parseXml = function _parseXml(xml) {
  // parse the xml into json to keep our standard
  return Xml2js.parseStringAsync(xml, {
    // trim text nodes
    trim: true,
    // don't parse single nodes into arrays
    explicitArray: false,
    // don't give a root object
    explicitRoot: false
  });
}
