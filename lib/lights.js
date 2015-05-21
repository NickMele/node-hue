var internals = {};

/**
 * @class Lights
 * @param {Object} hue the hue that these lights are associated with
 * @constructor
 */
module.exports = internals.Lights = function Lights(hue) {}

/**
 * Finds all the lights, or if an id is specified, a single light
 *
 * @method  get
 * @param   {String} id id of a single light to get information about
 * @return  {Promise} will return a promise that will resolve when the light(s) are found
 */
internals.Discover.prototype.get = function get(id) {}

internals.getAllLights = function getAllLights() {}
internals.getLight = function getLight() {}
