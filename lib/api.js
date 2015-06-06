// Load hue modules
var Debugger = require('./debugger');

var internals = {
  debug: new Debugger('api')
};

/**
 * @class Api
 * @param {Object} hue the hue instance this api is attached to
 * @constructor
 */
module.exports = internals.Api = function Api(hue) {

  internals.debug('Creating new Api instance');
  this._hue = hue;

}
