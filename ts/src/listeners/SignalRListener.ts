import { ICommandEmitter, ICommandResponseListener, ICommandRequestSender } from "../Abstraction";
import { ResponseListener} from "./ResponseListener";
import {CommandResponse} from '../Response';

export class SignalRListener extends ResponseListener {
    private _hub: HubProxy;
    
    constructor(private _hubConnection: HubConnection, hubName: string) {
        super();
        this._hub = this._hubConnection.createHubProxy("crs");
        
        this._hub.on("onCommandComplete", data => {
            CommandResponse.safeCreate(data, (response) => this.notify(new CommandResponse(data)) );
        });
        
        this._hubConnection.start().then(() => { 
            this.callbackId = this._hubConnection.id 
        });
    }
}