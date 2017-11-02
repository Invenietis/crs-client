import {
    SignalRConnection,
    SocketConnection
} from './event';
import {
    CommandEmitter,
    CommandEmitterProxy,
    FetchCommandSender,
    ResponseType,
    CommandResponse
} from './command';
import {
    EndpointMetadata,
    AmbiantValuesProvider,
    MetadataReader,
    FetchMetadataReader
} from './metadata';

/**
 * Wrap a crs endpoint connection.
 * Provide the crs endpoint metadata, the ambiant values and the {CommandEmitter} for the endpoint.
 * Each new {CrsEndpoint} instance must call the connect method in order to initialize the endpoint.
 * During the initialization phase, the CrsEndppoint will fetch the endpoint metadata to get information like the ambiant values, 
 * version number, etc. and try to establish a signalR connection
 */
export class CrsEndpoint {
    metadata: EndpointMetadata;
    readonly endpoint: string;
    private ambiantValuesProvider: AmbiantValuesProvider;
    private _emitter: CommandEmitterProxy;
    private _connection: SocketConnection;
    private _cmdSender: FetchCommandSender;

    constructor(endpoint: string)
    constructor(endpoint: string, connection: SocketConnection)
    constructor(endpoint: string, connection?: SocketConnection) {
        this.endpoint = endpoint;
        this.ambiantValuesProvider = new AmbiantValuesProvider();
        if (connection) {
            this._connection = connection;
        } else {
            this._connection = new SignalRConnection('/crs');
        }
        this._cmdSender = new FetchCommandSender();
        this._emitter = new CommandEmitterProxy(
            this.endpoint,
            this._cmdSender,
            this.ambiantValuesProvider,
            this._connection
        );
    }

    connect(): Promise<void> {
        const reader = new FetchMetadataReader();
        let socketCnx = Promise.resolve();
        if (this._connection) {
            socketCnx = this._connection.open();
        }

        return Promise.all([
            socketCnx,
            reader.read(this.endpoint, true)
                .then(resp => {
                    this.metadata = resp.payload;
                    this.ambiantValuesProvider.setValues(this.metadata.ambientValues);
                    this._cmdSender.setConnectionIdPropertyName(this.metadata.callerIdPropertyName);
                    this._emitter.ready();
                })])
            .then(_ => undefined);
    }

    send<T>(command: Object): Promise<T> {
        return this.emitter.emit<T>(command)
            .then(resp => resp.payload);
    }

    get emitter(): CommandEmitter {
        return this._emitter;
    }

    get version(): number {
        return this.metadata ? this.metadata.version : undefined;
    }

    get ambientValues(): { [ambiantValue: string]: any } {
        return this.metadata ? this.metadata.ambientValues : undefined;
    }

    get isConnected(): boolean {
        return !!this.metadata;
    }
}
