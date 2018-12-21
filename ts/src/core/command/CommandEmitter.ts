import { AmbiantValuesProvider } from '../metadata/AmbiantValuesProvider';
import { readCommandName } from './Command';
import { CommandResponse, ResponseType } from './CommandResponse';
import { CommandRequestSender } from './CommandRequestSender';
import { AsyncCommand } from '../async/AsyncCommand';
import { AsynchronousCommandReponse, SocketConnection } from '../async';

/**
 * Base class to emit CRS commands.
 * Each emitted command must be an instance of a class decorated by the {Command} decorator
 */
export class CommandEmitter {
    readonly endpoint: string;
    readonly sender: CommandRequestSender;
    readonly ambiantValues: AmbiantValuesProvider;
    private _socket: SocketConnection;
    constructor(endpoint: string, requestSender: CommandRequestSender, ambiantValues: AmbiantValuesProvider, socket?: SocketConnection) {
        this.endpoint = endpoint;
        this.sender = requestSender;
        this.ambiantValues = ambiantValues;
        this._socket = socket;
    }

    /**
     * Send the command to the configurated endpoint
     * @param command The command to send. Must be an instance of a class decorated with the {Command} decorator
     * @returns {Promise<CommandResponse>>}
     */
    async emit<TResp, TCmd extends Object = any>(command: TCmd): Promise<TCmd extends AsyncCommand ? AsynchronousCommandReponse<TResp> : CommandResponse<TResp>> {
        const commandName = readCommandName(command);
        const url = `${this.endpoint}/${commandName}`;
        const commandWithAV = this.ambiantValues.merge(command);
        const connectionId = this.getConnectionId();
        const response = await this.sender.send(url, commandWithAV, connectionId);

        if (response.responseType === ResponseType.Asynchronous) {
            return this.toAsyncResponse<TResp>(response) as any;
        }

        return response as any;
    }

    private getConnectionId(): string {
        return this._socket ? this._socket.connectionId : new Date().getTime().toString();
    }

    private toAsyncResponse<T>(response: CommandResponse<T>): AsynchronousCommandReponse<T> {
        if (!this._socket) {
            throw new Error(`An asynchronous command was made but the emitter does not support async response handling`);
        }

        return {
            ...response,
            payload: this._socket.getAsyncResult(response)
        };
    }
}
