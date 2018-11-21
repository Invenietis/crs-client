import { CrsEndpoint, CrsEndpointConfiguration } from './CrsEndpoint';
import { SocketConnection, SignalRConnection } from './event';
import { CommandEmitterProxy } from './command';

export type AsyncConfiguration = {
    wsUrl: string;
}

export interface AsyncCrsEndpointConfiguration extends CrsEndpointConfiguration {
    async: AsyncConfiguration;
}

/**
 * Wrap a crs endpoint with asynchronous command handling capabilities.
 * Use this class when you have at least one asynchrounous command to send and a
 * SignalR connection configured on your remote crs endpoint
 */
export class AsyncCrsEndpoint extends CrsEndpoint {
    private _connection: SocketConnection;
    private asyncConfig: AsyncConfiguration;

    constructor(endpoint: string, configuration: AsyncCrsEndpointConfiguration) {
        super(endpoint, configuration);
        this.asyncConfig = configuration.async;
        this._connection = new SignalRConnection(this.asyncConfig.wsUrl);
        this._emitter = new CommandEmitterProxy(
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
