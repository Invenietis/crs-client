import {ResponseListener} from './ResponseListener';
import {HttpListener} from './HttpListener';
import {SignalRListener} from './SignalRListener';
import {ICommandResponseListener} from "../Abstraction";
import {CommandResponse} from '../Response';

export class HubListener implements ICommandResponseListener{
    
    constructor();
    constructor(httpListener: HttpListener);
    constructor(httpListener: HttpListener, signalRListener: SignalRListener );
    constructor(private _http?: HttpListener, private _ws?: SignalRListener) {
        if(!this._http){
            this._http = new HttpListener();
        }
    }
    
    get callbackId(): string{
        return this._ws ? this._ws.callbackId : "";
    }
    
    on(commandName: string, callback: (response: CommandResponse) => void);
    on(commandName: string, commandId: string, callback: (response: CommandResponse) => void);
    on(commandName: string, commandIdOrCallback:any,callback?: (response: CommandResponse) => void){
        this._http.on(commandName, commandIdOrCallback, callback);
        if(this._ws){
            this._ws.on(commandName, commandIdOrCallback, callback);
            //TODO: delete callback if called via the other lsitener
            
            // if(typeof(commandIdOrCallback) == 'string'){
            //     this._http.on(commandName, commandIdOrCallback, (resp) =>{
            //         this._ws.off(commandName, commandIdOrCallback, callback);
            //     });
            // }
        }
    }
    
    off(commandName: string, callback: (response: CommandResponse) => void);
    off(commandName: string, commandId: string, callback: (response: CommandResponse) => void);
    off(commandName: string, commandIdOrCallback:any, callback?: (response: CommandResponse) => void){
        this._http.off(commandName,commandIdOrCallback, callback);
        if(this._ws){
            this._ws.off(commandName,commandIdOrCallback, callback);
        }
    }
}