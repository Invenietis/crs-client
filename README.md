# ck-crs
A library that allow you to emit command from Javascript to the ASP .NET server.<br>
This Version is a refactoring using ES6 modules and Promise with a commonjs compatibility.

##  How To Use

The simplest way to get a new emitter is via the ```CommandEmitter.create(uriBase)``` static method.<br>
Then you can send command with the ```emitter.emit(command)``` method.

```javascript
import {CommandEmitter, Command} from 'ck-crs/core';

var emitter = CommandEmitter.create('uriBase');

emitter.emit(new Command('do', {
    param1: 1,
    param2: '3712'
})).then((resp) => {
    console.log(resp);
 });

```