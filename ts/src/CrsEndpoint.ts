import {
EventReceiver,
SocketConnection
} from './event';
import {
    CommandEmitterSubscriber,
    FetchCommandSender
} from './command';
import {
    EndpointMetadata,
    AmbiantValuesProvider,
    MetadataReader,
    FetchMetadataReader
} from './metadata';

export class CrsEndpoint {
    readonly endpoint: string;
    metadata: EndpointMetadata;
    ambiantValues: AmbiantValuesProvider;
    private _emitter: CommandEmitterSubscriber;
    private _receiver: EventReceiver;
    
    constructor(endpoint: string, connection: SocketConnection) {
        this.endpoint = endpoint;
        this.ambiantValues = new AmbiantValuesProvider();
        this._receiver = new EventReceiver(connection);
        this._emitter = new CommandEmitterSubscriber(
            this.endpoint,
            new FetchCommandSender(),
            this.ambiantValues,
            this._receiver
        );
        const reader = new FetchMetadataReader();
        reader.read(endpoint)
            .then( resp => { 
                this.metadata = resp.payload;
                this.ambiantValues.setValues(this.metadata.ambientValues);
                this._emitter.ready();
            })
    }

    get emitter(): CommandEmitterSubscriber {
        return this._emitter;
    }

    get events(): EventReceiver {
        return this._receiver;
    }
}
