var Promise = require('bluebird');
var Url     = require('url');
var Xml2js  = Promise.promisifyAll(require("xml2js"));

var internals = {};

module.exports.getEndpoint = internals.getEndpoint = function (ip, path) {
  // check if we were given just the host, or a real url
  if (!/^https|^\/\//.test(ip)) {
    ip = 'http://' + ip;
  }
  // parse the url
  var parsed = Url.parse(ip);
  // modify the path to point to config
  parsed.pathname = path || '/';
  // format the parsed url back into a string
  return Url.format(parsed);
}

module.exports.parseXml = internals.parseXml = function (xml) {
  // parse the xml into json to keep our standard
  return Xml2js.parseStringAsync(xml, {
    // trim text nodes
    trim: true,
    // don't parse single nodes into arrays
    explicitArray: false,
    // don't give a root object
    explicitRoot: false
  });
}

module.exports.createBuffer = internals.createBuffer = function (payload) {

  var value = '';

  if (_.isArray(payload)) {
    value = payload.join('\n');
  }

  return new Buffer(value);

}

