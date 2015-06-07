// Load dependencies
var _ = require('lodash');

// Load hue modules
var Debugger = require('./debugger');

var internals = {
  debug: new Debugger('lights')
};

/**
 * @class Lights
 * @param {Object} hue the hue that these lights are associated with
 * @constructor
 */
module.exports = internals.Lights = function Lights(hue) {

  internals.debug('Creating new Lights instance');
  this.hue = hue;

  _.each(_.functions(this), function(method) {
    var func = this[method];
    this[method] = function() {
      var methodArgs = arguments;
      return this.hue.ready().bind(this).then(function() {
        return func.apply(this, methodArgs);
      });
    }.bind(this);
  }, this);

}

/**
 * Finds all the lights, or if an id is specified, a single light
 *
 * @method  get
 * @param   {String} id id of a single light to get information about
 * @return  {Promise} will return a promise that will resolve when the light(s) are found
 */
internals.Lights.prototype.get = function get(id) {
  console.log('getting lights')
}

/**
 * Sets the attributes on a specified light
 *
 * @method  set
 * @param   {String} id id of a single light to get information about
 * @param   {Object} settings the settings to be saved for the light
 */
internals.Lights.prototype.set = function set(id, settings) {}

internals._getAllLights = function getAllLights() {}
internals._getLight = function getLight() {}
