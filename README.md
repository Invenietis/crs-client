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
    .subscribe(response => {
        console.log(response);
    });
```

### ES5 in browser

First, include the library in your HTML

Use the ```crs-client.js``` only if you already have [rxjs](https://github.com/ReactiveX/rxjs) or rxjs/observable included.

If not, include the  ```crs-client-observable.js``` release.

```javascript
<script src="crs-client-observable.js"></script>
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

// get the command emitter for the endpoint
var emitter = endpoint.emitter;

// initialize the endpoint
endpoint.connect();

// send the command
emitter.emit(new SuperCmd('hello world!'))
    .subscribe(response => {
        console.log(response);
    });
```

*Note that crs-client use fetch to make xhr requests. You may need a pollyfill for older browser*
