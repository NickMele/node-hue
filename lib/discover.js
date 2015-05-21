// Load modules
var Socket = require('./socket');

var internals = {};

/**
 * @class   Discover
 * @param   {String} type the type of search to perform. if empty the default waterfall search will be performed
 * @constructor
 */
module.exports = internals.Discover = function Discover(type) {}

/**
 * Searches for a bridge via the UPnP method
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method upnp
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if there is an error finding the bridge
 */
internals.Discover.prototype.upnp = function upnp() {}

/**
 * Searches for a bridge via the N-UPnP method
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 * https://www.meethue.com/api/nupnp
 *
 * @method nupnp
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if there is an error finding the bridge
 */
internals.Discover.prototype.nupnp = function nupnp() {}

/**
 * Searches for a bridge via the IP Scan method
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method ip
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if there is an error finding the bridge
 */
internals.Discover.prototype.ip = function ip() {}
