import {ICommandEmitter,ICommandResponseListener } from './Abstraction';
import {CommandResponse} from './Response';
import {Command} from './Command';
import {CommandEmitter} from './CommandEmitter';
import {AjaxSender} from './AjaxSender';
import {SignalRListener} from './listeners/SignalRListener';
import {HubListener} from './listeners/HubListener';
import {HttpListener} from './listeners/HttpListener';

var _emitters: Array<ICommandEmitter> = new Array<ICommandEmitter>();

    
export var findEmitter = function(uriBase: string): ICommandEmitter{
    return _emitters.filter( t => t.uriBase === uriBase )[0];
}

export var sendCommand = function(uriBase: string, name: string, properties: any): Promise<CommandResponse>{
    var cmd =  new Command(name,properties);
    var httpListener = new HttpListener(); 
    var emitter = findEmitter( uriBase );
    if( emitter == null ){
        var listener;
        if($ && $.connection) {
            listener = new SignalRListener($.connection.hub, 'crs'+ uriBase)
        }
        emitter = new CommandEmitter( uriBase, new AjaxSender(httpListener), new HubListener(httpListener, listener) );
        _emitters.push( emitter);
    }
    
    return emitter.emit(cmd);
}