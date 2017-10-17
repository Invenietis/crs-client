# crs-client

The JavaScript client for [crs](https://github.com/Invenietis/crs)

## Installaion

> npm install crs-client

## Usage

### ESNext

```javascript
import { CrsEndpoint, Command } from 'crs-client';

// Specify the command name. 
@Command('supercommand')
class SuperCommand {
    constructor(hello) {
        this.hello = hello;
    }
}

// create a new endpoint
const endpoint = new CrsEndpoint('{server url}/{crs endpoint}');

// get the command emitter for the endpoint
const emitter = endpoint.emitter;

// initialize the endpoint
endpoint.connect();

// send the command
emitter.emit(new SuperCommand('hello world!'))
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
Crs.Command('CK.Crs.Samples.Commands-CK.Crs.Samples.Messages.SyncCommand')(SuperCmd)
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

*Note that crs-client use fetch to make xhr requests. You may need a pollyfill for older browser*
