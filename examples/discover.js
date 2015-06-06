var Hue = require('../lib');

Hue.discover().then(function(hues) {
  // hues[0] === new Hue('[IP Address of Hue]')
});

// Rediscover hues on the network (theoretical)
var hue = new Hue();
hue.discover().then(function(hues) {
  this.use(hues[0]);
});
