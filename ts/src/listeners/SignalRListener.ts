import { ICommandEmitter, ICommandResponseListener, ICommandRequestSender } from "../Abstraction";
import { ResponseListener} from "./ResponseListener";
import {CommandResponse} from '../Response';

export class SignalRListener extends ResponseListener {

    constructor(private _hubConnection: HubConnection, hubName: string) {
        super();
        
        this._hubConnection.proxies[hubName].client.ReceiveCommandResponse = data => this.notify(new CommandResponse(data));
    }
}