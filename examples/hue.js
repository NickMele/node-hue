var Hue = require('../lib');

// Create a hue instance by passing the IP of your hue
var hue = new Hue('192.168.1.100');

// Auto discover a hue, this will pick the first valid hue it encounters
new Hue();

// NOTE: When autodiscovering, all methods will wait for discovery to finish before running
// so the following will wait for the discover to finish, then fetch all the ligths
var auto = new Hue();

auto.lights.get().then(function(lights) {
  // Return the lights for the hue bridge that was found
}).error(function(error) {
  // Will return an error if no hue bridge was found
})
