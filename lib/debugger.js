// Load dependencies
var Debug = require('debug');
var Hoek = require('hoek');

var internals = {};

/**
 * @class   Debugger
 * @param   {Object} namespace the unique namespace for this debugger
 * @constructor
 */
module.exports = internals.Debugger = function Debugger(namespace) {
  return Debug(namespace || 'global');
}
