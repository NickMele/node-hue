// Load dependencies
var Dgram = require('dgram');
var _ = require('lodash');
var Hoek = require('hoek');
var Promise = require('bluebird');

var internals = {};

/**
 * @class Socker
 * @constructor
 */
module.exports = internals.Socket = function Socket() {

  var socket = this._socket = Dgram.createSocket('udp4');

  socket.on('close', function() {
    socket = null;
  });

}

/**
 * Sends a message on the socket and waits for X amount of time for messages
 * https://nodejs.org/api/dgram.html#dgram_socket_send_buf_offset_length_port_address_callback
 *
 * @method  send
 * @param   {Mixed}   payload the payload to be sent to the socket
 * @param   {Number}  port the destination port
 * @param   {String}  address the destination host or ip
 * @param   {Nunber}  timeout the amount of time to listen for returning messages on the socket
 * @return  {Promise} will return a promise that will resolve with the messages responded to on the socket
 */
internals.Socket.prototype.send = Promise.method(function send(payload, port, address, timeout) {

  Hoek.assert(_.isString(payload) || _.isArray(payload), '`payload` must be a string or an array')
  Hoek.assert(_.isNumber(port), '`port` must be a number.');
  Hoek.assert(_.isString(address), '`address` must be a string.');

  var buffer = internals._createBuffer(payload);
  var messages = [];

  return Promise.using(this.getSocket(), function(socket) {
    return new Promise(function(resolve, reject) {

      // listen for errors on the socket
      socket.on('error', reject);

      // listen for messages on the socket
      socket.on('message', function(message, rinfo) {
        messages.push({
          message: message.toString('utf8'),
          original_message: message,
          rinfo: rinfo
        });
      });

      // TODO: remove this test data
      messages.push({
        message: 'IpBridge',
        rinfo: {
          address: '127.0.0.1'
        }
      });

      // Send the packet
      socket.send(buffer, 0, buffer.length, port, address);

      return resolve(messages);

    }).delay(timeout || 0);
  });
});

/**
 * Returns the socket, along with a disposer method that will cleanup the socket when done
 *
 * @method  getSocket
 * @return  {Promise} will return a promise that resolves to the socket created
 */
internals.Socket.prototype.getSocket = Promise.method(function getSocket() {

  var socket = this._socket;

  Hoek.assert(_.isObject(socket), 'Could not find socket to send to the disposer.');

  return Promise.resolve(this._socket).disposer(function(socket) {
    if (socket) {
      socket = socket.close() && null;
    }
  });
});

internals._createBuffer = function _createBuffer(payload) {

  var value = '';

  if (_.isArray(payload)) {
    value = payload.join('\n');
  }

  return new Buffer(value);

}
