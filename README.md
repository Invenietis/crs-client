# crs-client

The JavaScript client library for [crs](https://github.com/Invenietis/crs)

## Installation

> npm install axios crs-client --save

## Usage

### TypeScript / ESNext

```javascript
import { CrsEndpoint, Command } from 'crs-client';

// Create a command class and bound to a CRS commmand
@Command('supercommand')
class SuperCommand {
    constructor(hello) {
        this.hello = hello;
    }
}

// create a new endpoint where {server url} is your server URL (empty is same origin) 
// and {crs endpoint} is the path to the CRS endpoint
const endpoint = new CrsEndpoint('{server url}/{crs endpoint}');

// initialize the endpoint
endpoint.connect();

// send the command
endpoint.send(new SuperCommand('hello world!'))
    .then(response => {
        console.log(response);
    });
```

### ES5 in browser

First, include the library ```crs-client.js``` in your HTML


```javascript
<script src="crs-client.js"></script>
```

The script will add the ```Crs``` object on the ```window``` object.

```javascript
// Specify the command name. 
Crs.Command('supercommand')(SuperCmd)
function SuperCmd(hello) {
    this.hello = hello;
}

// create a new endpoint
var endpoint = new Crs.CrsEndpoint('{server url}/{crs endpoint}');

// initialize the endpoint
endpoint.connect();

// send the command
const response = await endpoint.send(new SuperCmd('hello world!'));
```
