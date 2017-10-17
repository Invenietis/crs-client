import { AmbiantValuesProvider } from '../metadata/AmbiantValuesProvider';
import { readCommandName, readCommandEvents } from './Command';
import { CommandResponse, AsynchronousCommandReponse, ResponseType } from './CommandResponse';
import { CommandRequestSender } from './CommandRequestSender';
import { SocketConnection } from '../event/SocketConnection';

/**
 * Base class to emit commands
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

    emit<T>(command: Object): Promise<CommandResponse<T>> {
        const commandName = readCommandName(command);
        const url = `${this.endpoint}/${commandName}`;
        const commandWithAV = this.ambiantValues.merge(command);

        return this.sender.send(url, commandWithAV, this._socket ? this._socket.connectionId : undefined)
            .then(response => {
                if (response.responseType === ResponseType.Asynchronous) {
                    if (this._socket) {
                        return this.toAsyncResponse(response);
                    }
                    console.warn('An asynchronous command was made but no socket connection was provided');
                }
                return response;
            });
    }

    private toAsyncResponse<T>(response: CommandResponse<T>): AsynchronousCommandReponse<T> {
        if (response.responseType !== ResponseType.Asynchronous || !this._socket) {
            throw 'Could not convert response to async';
        }

        return {
            ...response,
            payload: this._socket.getResultFor(response.commandId)
        };
    }
}

/**
 * Emitter that enqueue the emitted commands until the endpoint is ready
 */
export class CommandEmitterProxy extends CommandEmitter {
    private pendingCommands: Array<{
        command: Object,
        resolver: (response: CommandResponse<any>) => void,
        rejector: (error: any) => void
    }> = [];
    private isReady: boolean = false;

    constructor(endpoint: string, requestSender: CommandRequestSender, ambiantValues: AmbiantValuesProvider, socket?: SocketConnection) {
        super(endpoint, requestSender, ambiantValues, socket);
    }

    ready() {
        this.pendingCommands.forEach(pending => {
            super.emit<any>(pending.command)
                .then(resp => {
                    pending.resolver(resp);
                })
                .catch(e => pending.rejector(e));
        });
        this.isReady = true;
    }

    emit<T>(command: Object): Promise<CommandResponse<T>> {
        if (this.isReady) {
            return super.emit(command);
        }

        return new Promise<CommandResponse<T>>((resolve, reject) => {
            this.pendingCommands.push({ command, resolver: resolve, rejector: reject });
        });
    }
}
