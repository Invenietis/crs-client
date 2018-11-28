import { CrsEndpoint, CrsEndpointConfiguration } from '../CrsEndpoint';
import { SocketConnection } from './SocketConnection';
import { AsyncCommandEmitter } from './AsyncCommandEmitter';

/**
 * Base class that wrap a crs endpoint with asynchronous command handling capabilities.
 */
export abstract class AsyncCrsEndpoint extends CrsEndpoint {
    private _connection: SocketConnection;
    private _emitter: AsyncCommandEmitter;

    constructor(endpoint: string, configuration: CrsEndpointConfiguration, socket: SocketConnection) {
        super(endpoint, configuration);
        this._connection = socket;
        this._emitter = new AsyncCommandEmitter(
            this.endpoint,
            this._cmdSender,
            this.ambiantValuesProvider,
            this._connection
        );
    }

    async connect() {
        await this._connection.open();
        await super.connect();
    }
}
