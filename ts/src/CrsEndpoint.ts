import {
EventReceiver,
SocketConnection
} from './event';
import {
    CommandEmitterSubscriber,
    CommandEmitter,
    FetchCommandSender
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
 * During the initialization phase, the CrsEndppoint will fetch the endpoint metadata in order to get information like the ambiant values, version number, etc.
 */
export class CrsEndpoint {
    metadata: EndpointMetadata;
    readonly endpoint: string;
    private ambiantValuesProvider: AmbiantValuesProvider;
    private _emitter: CommandEmitterSubscriber;
    private _receiver: EventReceiver;
    
    constructor(endpoint: string)
    constructor(endpoint: string, connection: SocketConnection)
    constructor(endpoint: string, connection?: SocketConnection) {
        this.endpoint = endpoint;
        this.ambiantValuesProvider = new AmbiantValuesProvider();
        if (connection) {
            this._receiver = new EventReceiver(connection);
        }

        this._emitter = new CommandEmitterSubscriber(
            this.endpoint,
            new FetchCommandSender(),
            this.ambiantValuesProvider,
            this._receiver
        );
    }

    connect(): Promise<void> {
        const reader = new FetchMetadataReader();
        
        return reader.read(this.endpoint)
            .then( resp => { 
                this.metadata = resp.payload;
                this.ambiantValuesProvider.setValues(this.metadata.ambientValues);
                this._emitter.ready();
            })
    }

    get emitter(): CommandEmitter {
        return this._emitter;
    }
    
    get version(): number {
        return this.metadata ? this.metadata.version : undefined;
    }

    get ambientValues(): {[ambiantValue: string]: any} {
        return this.metadata ? this.metadata.ambientValues : undefined;
    }

    get isConnected(): boolean {
        return !!this.metadata;
    }

    // get events(): EventReceiver {
    //     return this._receiver;
    // }
}
