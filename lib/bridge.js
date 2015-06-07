// Load dependencies
var Hoek     = require('hoek');
var Events   = require('events');
var Debugger = require('./debugger');

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

  this._lights = new Lights(this);
  internals.debug('Attached a Lights instance to the new bridge instance');

};

/**
 * Initializes the bridge using the ip address provided
 *
 * @method init
 * @param {String} ip
 * @return {Promise} will return a promise that will resolve when the bridge is ready
 */
internals.Bridge.prototype.init = function init(ip) {
  // TODO: don't emit until user created and ready
  this.emit('bridge');
};

/**
 * Creates a user on the bridge, this will give us access to the API methods
 * http://www.developers.meethue.com/documentation/configuration-api#71_create_user
 *
 * @method createUser
 * @param {String} username
 * @return {Promise} will return a promise that will resolve when the user is created
 */
internals.Bridge.prototype.createUser = function createUser(username) {};
