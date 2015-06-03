var Promise  = require('bluebird');
var Url      = require('url');
var Xml2js   = Promise.promisifyAll(require("xml2js"));
var _        = require('lodash');
var Debugger = require('./debugger');

var internals = {
  debug: new Debugger('utils')
};

module.exports.getEndpoint = internals.getEndpoint = function (ip, path) {
  internals.debug('Creating url endpoint for %s, %s', ip, path);
  // check if we were given just the host, or a real url
  if (!/^https|^\/\//.test(ip)) {
    internals.debug('making sure that the ip contains http://');
    ip = 'http://' + ip;
  }
  // parse the url
  var parsed = Url.parse(ip);
  // modify the path to point to config
  internals.debug('Replacing pathname with new path: %s -> %s', parsed.pathname, path);
  parsed.pathname = path || '/';
  // format the parsed url back into a string
  return Url.format(parsed);
}

module.exports.parseXml = internals.parseXml = function (xml) {
  var settings = {
    // trim text nodes
    trim: true,
    // don't parse single nodes into arrays
    explicitArray: false,
    // don't give a root object
    explicitRoot: false
  };
  internals.debug('Parsing xml using the following settings: %o', settings);
  // parse the xml into json to keep our standard
  return Xml2js.parseStringAsync(xml, settings);
}

module.exports.createBuffer = internals.createBuffer = function (payload) {
  internals.debug('Converting payload to a buffer: %o', payload);
  var value = '';
  if (_.isArray(payload)) {
    value = payload.join('\n');
  }
  return new Buffer(value);
}

