import { ICommandRequestSender, CommandResponse } from "./Abstraction";
import {Command}  from "./Command";

import{HttpListener} from './listeners/HttpListener'

export class AjaxSender implements ICommandRequestSender {
    constructor();
    constructor(listener: HttpListener)
    constructor(private _listener?: HttpListener){
        if(this._listener == undefined){
            this._listener = new HttpListener();
        }
    }
    
    send(url: string, command: Command) {
        var json = JSON.stringify(command.properties);
        
        return new Promise<any>((resolve, reject) =>{
            $.ajax(url, {
                type: 'POST',
                data: json,
                contentType: 'application/json',
                dataType: 'JSON'
            }).then((data) => {
                var resp = new CommandResponse(data, command);
                
                if(resp.responseType < 1){
                    this.notifyListener(resp);
                }
                
                resolve(resp);
            }, reject);
        }) 
    }
    
    private notifyListener(resp){
        setTimeout(() => {
            if(this._listener != undefined){
                this._listener.notify(resp)
            }
        }, 5);
    }
}