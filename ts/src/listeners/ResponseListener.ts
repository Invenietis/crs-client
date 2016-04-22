import { ICommandEmitter, ICommandResponseListener, ICommandRequestSender } from "../Abstraction";
import { AjaxSender } from "../AjaxSender";
import {CommandResponse} from '../Response';

export abstract class ResponseListener implements ICommandResponseListener{
    callbackId: string = "";
    
    protected _listeners: {[commandName:string]: {[commandId:string]: Array<(response: CommandResponse) => void>}} = {};
    
    constructor(){}
    
    notify(response: CommandResponse){
        console.log(this._listeners);
        
        for(var commandName in this._listeners){
            var idListeners = this._listeners[commandName][response.commandId];
            var listeners = this._listeners[commandName][commandName];
            
            this.executeCallbacks(idListeners, response);
            this.executeCallbacks(listeners, response);
            
            //unregister callbacks for the commandId
            delete this._listeners[commandName][response.commandId];
        }
    }
    
    on(commandName: string, callback: (response: CommandResponse) => void)
    on(commandName: string, commandId: string, callback: (response: CommandResponse) => void);
    on(commandName: string, commandIdOrCallback:any,callback?: (response: CommandResponse) => void){
        var commandId = typeof(commandIdOrCallback) == 'string' ? <string>commandIdOrCallback : commandName;
        callback = callback || commandIdOrCallback;
        
        if(this._listeners[commandName] == undefined){
            this._listeners[commandName] = {};
        }
        if(this._listeners[commandName][commandId] == undefined){
            this._listeners[commandName][commandId] = [];
        }
        
        this._listeners[commandName][commandId].push(callback);
    }
    
    off(commandName: string, callback: (response: CommandResponse) => void);
    off(commandName: string, commandId: string, callback: (response: CommandResponse) => void);
    off(commandName: string, commandIdOrCallback:any,callback?: (response: CommandResponse) => void){
        var commandId = typeof(commandIdOrCallback) == 'string' ? <string>commandIdOrCallback : commandName;
        callback = callback || commandIdOrCallback;
        
        var listeners = this._listeners[commandName][commandId];
        var i = listeners.indexOf(callback);
        listeners.splice(i, 1);
    }
    
    private executeCallbacks(callbacks: Array<(response: CommandResponse) => void>, response: CommandResponse){
        if(callbacks){
            callbacks.forEach( cb => cb(response));
        }
    }
}