import { ICommandEmitter, ICommandRequestSender, CommandResponse } from "./Abstraction";
import { HubListener } from "./listeners/HubListener";
import { HttpListener } from "./listeners/HttpListener";
import { AjaxSender } from "./AjaxSender";


import { Command }  from "./Command";

export class CommandEmitter implements ICommandEmitter {
    private _sender: ICommandRequestSender;
    public listener: HubListener;
    
    public static create(uriBase: string){
        var httpListener = new HttpListener();
        var hub = new HubListener(httpListener);
        
        return new CommandEmitter(uriBase, new AjaxSender(httpListener), hub);
    }
    
    constructor(public uriBase: string, commandRequestSender: ICommandRequestSender, hubListener: HubListener) {
        this._sender = commandRequestSender;
        this.listener = hubListener;
    }
    
    public emit(command: Command): Promise<CommandResponse> {
        console.info('Sending Command : ' + command.name );
        var url = this.uriBase + '/' + command.name + '?c=' + (this.listener ? this.listener.callbackId : '');
        var self = this;
        
        return new Promise<CommandResponse>((resolve, reject) =>{
            self._sender.send(url, command).then((resp: CommandResponse) => {
                self.listener.on(command.name, resp.commandId, (data) =>{
                    if(data.responseType == -1 ){
                        reject(data);
                    } else {
                        resolve(data);
                    }
                });
            }, reject);
        });
    }
}