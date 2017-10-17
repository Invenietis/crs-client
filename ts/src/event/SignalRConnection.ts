import { HubConnection } from "@aspnet/signalr-client";
import { SocketConnection, ConnectionStatus } from "./SocketConnection";

export class SignalRConnection implements SocketConnection {
    private _connection: HubConnection;
    private _onConnectedCbs: Array<() => void> = [];
    private _onDisconnectedCbs: Array<() => void> = [];
    private _connectionId: string;

    constructor(path: string) {
        this._connection = new HubConnection(path);
        this._connection.onclose(() => {
            this._connectionId = null;
            this._onDisconnectedCbs.forEach(cb => cb());
        });
    }

    get connectionId() {
        return this._connectionId;
    }

    get status() {
        return this._connection ? ConnectionStatus.connected : ConnectionStatus.disconnected;
    }

    onConnected(callback: () => void) {
        this._onConnectedCbs.push(callback);
    }

    onDisconnected(callback: () => void) {
        this._onDisconnectedCbs.push(callback);
    }

    onResult(callback: (...data: any[]) => void) {
        this._connection.on('ReceiveResult', callback);
    }

    offResult(callback: (...data: any[]) => void) {
        this._connection.off('ReceiveResult', callback);
    }

    getResultFor(commandId: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const onresult = (sourceCommandId: string, commandType, response) => {
                if (commandId === sourceCommandId) {
                    resolve(response);
                    this.offResult(onresult);
                }
            };
            this.onResult(onresult);
        });
    }

    open() {
        this._connection.on('ReceiveCallerId', (connectionId) => {
            this._connectionId = connectionId;
            this._onConnectedCbs.forEach(cb => cb());
        });
        return this._connection.start();
    }

    close() {
        this._connection.stop();
    }
}