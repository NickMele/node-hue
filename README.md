:heavy_exclamation_mark::heavy_exclamation_mark::heavy_exclamation_mark:
# THIS MODULE IS IN EARLY DEVELOPMENT AND NOT READY TO BE USED
:heavy_exclamation_mark::heavy_exclamation_mark::heavy_exclamation_mark:

# Node Hue
Module to communicate with Philips Hue API

## Installation

```
npm install --save node-hue
```

## Discover Bridges

### Auto-Discover Bridge
This will search for bridges, and use the first valid bridge that the search comes across

```
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