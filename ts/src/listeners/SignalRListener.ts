import { ICommandEmitter, ICommandResponseListener, ICommandRequestSender, CommandResponse } from "../Abstraction";
import { ResponseListener} from "./ResponseListener";

export class SignalRListener extends ResponseListener {

    constructor(private _hubConnection: HubConnection, hubName: string) {
        super();
        
        this._hubConnection.proxies[hubName].client.ReceiveCommandResponse = data => this.notify(new CommandResponse(data));
    }
}