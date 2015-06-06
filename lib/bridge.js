// Load dependencies
var Hoek   = require('hoek');
var Events = require('events');

var internals = {};

/**
 * @class Bridge
 * @param {Object} hue the hue instance this bridge is attached to
 * @param {Object} ip the IP address of the bridge
 * @constructor
 */
module.exports = internals.Bridge = function Bridge(hue, ip) {

  this._events = new Events.EventEmitter();
  hue.addEmitter(this._events);

  this._events.emit('bridge');

};

// TODO: Register user
