// Load dependencies
var Hoek     = require('hoek');
var Events   = require('events');
var Debugger = require('./debugger');
var Promise  = require('bluebird');

// Load modules
var Lights   = require('./lights');

// Declare internals
var internals = {
  debug: new Debugger('bridge')
};

/**
 * @class Bridge
 * @constructor
 */
module.exports = internals.Bridge = function Bridge() {

  this.lights = new Lights(this);
  internals.debug('Attached a Lights instance to the new bridge instance');

};

/**
 * Initializes the bridge using the ip address provided
 *
 * @method init
 * @param {String} ip
 * @param {String} username
 * @return {Promise} will return a promise that will resolve when the bridge is ready
 */
internals.Bridge.prototype.init = function init(ip, username) {
  internals.debug('Initializing the bridge: %s (%s)', ip, username);
  this.createUser().bind(this).then(function() {
    internals.debug('Emitting bridge event');
    this._events.emit('bridge.initialized');
  });
};

/**
 * Creates a user on the bridge, this will give us access to the API methods
 * http://www.developers.meethue.com/documentation/configuration-api#71_create_user
 *
 * @method createUser
 * @param {String} username
 * @return {Promise} will return a promise that will resolve when the user is created
 */
internals.Bridge.prototype.createUser = Promise.method(function createUser(username) {
  internals.debug('Creating the user on the bridge');
  return Promise.resolve();
});
