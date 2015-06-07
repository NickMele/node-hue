# Node Hue
Module to communicate with Philips Hue API

## Installation

```shell
npm install --save node-hue
```

## Discover Bridges

### Auto-Discover Bridge
This will search for bridges, and use the first valid bridge that the search comes across

```javascript
var hue = new Hue(<UserName>);
```

### Manually Assign Bridge

```
var hue = new Hue(<UserName>, <IP Address>);
```

## Configuration

### Delete user

```
hue.config.user.delete(<UserName>)
  .then(function() {})
  .error(function(error) {});
```

## Lights
These calls can be made immediately after creating the instance. Even if the module is still configuring the bridge. Internally the module will wait until the bridge is ready to accept calls. So essentially When making a call to get lights the flow is as follows:

```
var hue = new Hue('testUser');
// 1. Module begins searching for a bridge on your network

hue.lights.get();
// 2. Module "queues" up your call and waits for bridge to be ready
// 3. Module will continue searching for the bridge
// 4. Once bridge is found, the user will be created on bridge (or just reused if already created)
// 5. Module notifies itself that the bridge is ready
// 6. Your call is now made to get the lights and your promise is resolved with the lights

```

### Search for new lights

```
hue.lights.search()
  .then(function() {})
  .error(function(error) {});
```

### Get all lights

```
hue.lights.get()
  .then(function(lights) {})
  .error(function(error) {});
```

### Get light attributes

```
hue.lights.get(<id>)
  .then(function(light) {})
  .error(function(error) {});
```

### Set light attributes or state
The module is smart enough to determine what it needs to do with the data passed in.

```
hue.lights.set(<id>, <Attrbutes|State>)
  .then(function(light) {})
  .error(function(error) {});
```

### Delete light

```
hue.lights.delete(<id>)
  .then(function() {})
  .error(function(error) {});
```
