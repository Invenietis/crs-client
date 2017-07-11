import { EndpointMetadata } from './EndpointMetadata';
import { AmbiantValuesProvider } from './AmbiantValuesProvider';
import { MetadataReader, FetchMetadataReader } from './MetadataReader';
import { CommandEmitterProxy, CommandEmitter } from './CommandEmitter';
import { FetchCommandSender } from './CommandRequestSender';

export class CrsEndpoint {
    readonly endpoint: string;
    metadata: EndpointMetadata;
    ambiantValues: AmbiantValuesProvider;
    _emitter: CommandEmitterProxy;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
        this.ambiantValues = new AmbiantValuesProvider();
        this._emitter = new CommandEmitterProxy(
            this.endpoint,
            new FetchCommandSender(),
            this.ambiantValues
        );
        const reader = new FetchMetadataReader();
        reader.read(endpoint)
            .then( resp => { 
                this.metadata = resp.payload;
                this.ambiantValues.setValues(this.metadata.ambientValues);
                this._emitter.ready();
            })
    }

    get emitter(): CommandEmitter {
        return this._emitter;
    }
}
