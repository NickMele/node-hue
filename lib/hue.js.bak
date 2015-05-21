// Dependencies
var _ = require('lodash');
var async = require('async');
var dgram = require('dgram');
var Promise = require('bluebird')
var request = Promise.promisifyAll(require("request"));
var URL = require('url');
var xml2js = Promise.promisifyAll(require("xml2js"));

// Internal reference
var internals = {};

/**
 * @class Hue
 * @param {Object} config
 * @constructor
 */
function Hue(config) {

  var self = this;

  // Store the config
  self.config = _.defaults(config, {
    autoDiscover: true
  });

  if (!self.config.bridge && self.config.autoDiscover) {
    // discover the bridge automatically if we werent provided one and the setting is turned on
    self.discover().then(function (bridges) {
      if (_.isArray(bridges) && bridges.length) {
        self.bridge = bridges[0].internalipaddress;
      }
    });
  } else if (self.config.bridge) {
    // if we were given a bridge, use it
    self.bridge = self.config.bridge;
  }

}

/**
 * Discovers the bridge on the network
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method discover
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if bridge is not found
 */
Hue.prototype.discover = function () {

  // Search for the bridge in the following order
  // 1. Search via UPnP
  // 2. Search via N-UPnP
  // 3. Search via IP Scan
  var self = this;
  var bridges = [];

  return new Promise(function (resolve, reject) {

    // Using the detectSeries function in async, we can run through our list of tasks.
    // When each search is done, if a bridge was found we can record it as found.
    // Once a bridge is found, the final callback will be called and we can proceed on
    async.detectSeries([
      self._upnpSearch.bind(self),
      self._nupnpSearch.bind(self),
      self._ipScan.bind(self)
    ], function(task, found) {
      // run the task, and see if we find any addresses
      task().then(function(results) {
        if (_.isArray(results) && results.length) {
          // store the found bridges to be resolved with
          bridges = results;
          // let async know that we found what we needed, this will end the detection
          found(true);
        }
      });
    }, function() {
      return resolve(bridges);
    });

  });

};

/**
 * Searches for a bridge via the UPnP method
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method _upnpSearch
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if bridge is not found
 */
Hue.prototype._upnpSearch = function () {
  var self = this;
  return new Promise(function (resolve, reject) {

    // create a list to store found bridges
    var bridges = [];

    // create the socket using the node dgram module
    var socket = dgram.createSocket('udp4');

    // create the payload we will send
    var payload = new Buffer([
      'M-SEARCH * HTTP/1.1',
      'HOST: 239.255.255.250:1900',
      'MAN: ssdp:discover',
      'MX: 10',
      'ST: ssdp:all'
    ].join('\n'));

    // listen for errors on the socket
    socket.on('error', function(error) {
      return reject(error);
    });

    // listen for messages on the socket
    socket.on('message', function(message, info) {
      // convert the message to a string so we can parse it
      var formattedMessage = message.toString('utf8');
      // check to see if this response is from a Hue bridge
      if (/IpBridge/.test(formattedMessage)) {
        // check if we already have this address
        if (!_.contains(bridges, info.address)) {
          bridges.push(info.address);
        }
      }
    });

    // Send the packet
    socket.send(payload, 0, payload.length, 1900, "239.255.255.250");

    // Wait 5 seconds before giving up
    setTimeout(function() {
      // close the socket
      socket.close();
      // clear out the socket so we dont try to close it again
      socket = null;
      // get the configuration for each bridge found
      Promise.map(bridges, function(bridge) {
        return self.getDescription(bridge).then(function (description) {
          return Promise.resolve({
            id: description.device.serialNumber,
            internalipaddress: bridge
          });
        });
      }).then(resolve);
    }, 5000);

    // make sure we close the socket if the node process gets killed before we are done
    process.on('exit', function() {
      if (socket) {
        socket.close();
      }
    });

  });
};

/**
 * Searches for a bridge via the N-UPnP method
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 * https://www.meethue.com/api/nupnp
 *
 * @method _nupnpSearch
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if bridge is not found
 */
Hue.prototype._nupnpSearch = function () {
  // Make a request to the Hue endpoint that will give us a list of bridges
  return request.getAsync('https://www.meethue.com/api/nupnp', {
    json: true
  }).spread(function(response, json) {
    // we just want to return the json object that was found
    return Promise.resolve(json);
  });
};

/**
 * Searches for a bridge via the IP Scan method
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method _ipScan
 * @return {Promise} will return a promise that will resolve when bridge is discovered, or reject if bridge is not found
 */
Hue.prototype._ipScan = function () {
  return new Promise(function (resolve) {
    resolve([]);
  });
};

/**
 * Get the configuration of the bridge
 * http://www.developers.meethue.com/documentation/configuration-api
 *
 * @method getConfig
 * @return {Promise} will return a promise that resolves with the configuration object from the api
 */
Hue.prototype.getConfig = function (bridge) {
  // check if we were given just the host, or a real url
  if (!/^https|^\/\//.test(bridge)) {
    bridge = 'http://' + bridge;
  }

  // parse the url
  var parsed = URL.parse(bridge);

  // modify the path to point to config
  parsed.pathname = '/api/config';

  return request.getAsync(URL.format(parsed), {
    json: true
  }).spread(function(response, json) {
    return Promise.resolve(json);
  });
};

/**
 * Get the description for the specified bridge
 * http://www.developers.meethue.com/documentation/hue-bridge-discovery
 *
 * @method getDescription
 * @return {Promise} will return a promise that resolves with the parsed description as an object
 */
Hue.prototype.getDescription = function (bridge) {
  // check if we were given just the host, or a real url
  if (!/^https|^\/\//.test(bridge)) {
    bridge = 'http://' + bridge;
  }

  // parse the url
  var parsed = URL.parse(bridge);

  // modify the path to point to config
  parsed.pathname = '/description.xml';

  // make a request to get the description xml
  return request.getAsync(URL.format(parsed)).spread(function(response, xml) {
    // parse the xml into json to keep our standard
    return xml2js.parseStringAsync(xml, {
      // trim text nodes
      trim: true,
      // don't parse single nodes into arrays
      explicitArray: false,
      // don't give a root object
      explicitRoot: false
    });
  });
};

/**
 * Creates a new user in the API
 * http://www.developers.meethue.com/documentation/configuration-api#71_create_user
 *
 * @method createUser
 * @param {Object} body the body arguments that will be sent to the API
 * @return {Promise} promise that will be resolved when the user is created, or rejected if the user fails to be created
 */
Hue.prototype.createUser = function (body) {
};

module.exports = Hue;
