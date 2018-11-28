import { BasicCommandEmitter, CommandRequestSender, CommandResponse, ResponseType } from "../command";
import { AmbiantValuesProvider } from "../metadata";
import { SocketConnection } from "./SocketConnection";
import { AsynchronousCommandReponse } from "./AsyncCommandResponse";

export class AsyncCommandEmitter {
    private _socket: SocketConnection;
    private _emitter: BasicCommandEmitter;
    constructor(endpoint: string, requestSender: CommandRequestSender, ambiantValues: AmbiantValuesProvider, socket?: SocketConnection) {
        this._emitter = new BasicCommandEmitter(endpoint, requestSender, ambiantValues);
        this._socket = socket;
    }

    async emit<T=any>(command: Object): Promise<AsynchronousCommandReponse<T>> {
        const response = await this._emitter.emit<T>(command);
        return this.toAsyncResponse<T>(response);
    }

    private toAsyncResponse<T>(response: CommandResponse<T>): AsynchronousCommandReponse<T> {
        const payload =
            response.responseType === ResponseType.Asynchronous ?
                this._socket.getAsyncResult<T>(response.commandId) :
                Promise.resolve(response.payload);

        return {
            ...response,
            payload
        };
    }
}