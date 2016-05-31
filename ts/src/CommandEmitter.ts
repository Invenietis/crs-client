import { ICommandEmitter, ICommandRequestSender } from "./Abstraction";
import {CommandResponse, ResponseTypes} from './Response';
import { HubListener } from "./listeners/HubListener";
import { HttpListener } from "./listeners/HttpListener";
import { SignalRListener } from "./listeners/SignalRlistener";

import { AjaxSender } from "./AjaxSender";
import { Command }  from "./Command";
import { MetaResponse, CrsMeta } from './Meta'
import { MetaProvider, HttpMetaProvider } from './MetaProvider'

export class CommandEmitter implements ICommandEmitter {
    private _sender: ICommandRequestSender;
    private _metaProvider: MetaProvider;
    public listener: HubListener;
    public meta: CrsMeta = null;
    private _metaPromise: Promise<CrsMeta>;
    
    public static create(uriBase: string)
    public static create(uriBase: string, signalRConnection: SignalR.Hub.Connection)
    public static create(uriBase: string, signalRConnection?: SignalR.Hub.Connection){
        var httpListener = new HttpListener();
        var wsListener = signalRConnection ? new SignalRListener(signalRConnection, "crs") : null;
        var hub = new HubListener(httpListener, wsListener);
        var metaProvider = new HttpMetaProvider(uriBase);
        
        return new CommandEmitter(uriBase, new AjaxSender(httpListener), hub, metaProvider);
    }
    
    constructor(public uriBase: string, commandRequestSender: ICommandRequestSender, hubListener: HubListener, metaProvider: MetaProvider ) {
        this._sender = commandRequestSender;
        this.listener = hubListener;
        this._metaProvider = metaProvider;
        this.loadMeta();
    }
    
    public emit(command: Command);
    public emit(commandName:string, properties:any);
    public emit(commandOrName: Command | string, properties?: any ): Promise<CommandResponse> {
        var command;
        if(typeof commandOrName == 'string'){
            command = new Command(<string>commandOrName, properties);
        } else {
            command = <Command>commandOrName;
        }
        
        var url = this.uriBase + '/' + command.name + '?c=' + (this.listener ? this.listener.callbackId : '');
        var self = this;
        
        return new Promise<CommandResponse>((resolve, reject) => {
            self._metaPromise.then(m => {
                self.injectAmbientValues(command);
                
                self._sender.send(url, command).then((resp: CommandResponse) => {
                    self.listener.on(command.name, resp.commandId, (data) =>{
                        if(data.responseType == ResponseTypes.InternalError || data.responseType == ResponseTypes.ValidationError ){
                            reject(data);
                        } else {
                            resolve(data);
                        }
                    });
                    }, reject);
            });
        });
    }
    
    private loadMeta(): Promise<CrsMeta>{
        var self = this;
        
        this._metaPromise = this._metaProvider.load().then(r => {
            self.meta = r.payload;
            return r.payload;
        });
        this._metaPromise.catch(err => {
             throw "Could not load meta"
        });
        
        return this._metaPromise;
    }
    
    private injectAmbientValues(command: Command){
        if(this.meta){
            for(var aVal in this.meta.ambientValues){
                if(command.properties[aVal] == this.meta.ambientValues[aVal]){
                    console.warn(`The ambient value ${aVal} should not be provided`);
                } else if( command.properties[aVal] != undefined ){
                    throw `The command parameter ${aVal} is an ambiant value and should not be provided`;
                }
                
                command.properties[aVal] = this.meta.ambientValues[aVal]
            }
        } else{
            throw "Meta data are not loaded";
        }
    }
}