import {
    BasicCommandEmitter,
    AxiosCommandSender,
    CommandEmitter,
    CommandResponse,
} from './command';
import {
    EndpointMetadata,
    AmbiantValuesProvider,
    FetchMetadataReader,
    MetadataOptions,
    defaultMetadataOptions
} from './metadata';
import http, { AxiosInstance } from 'axios';

export interface CrsEndpointConfiguration {
    /**
     * Override the default Axios instance used by the {@link AxiosCommandSender}
     * @see https://github.com/axios/axios#creating-an-instance
     */
    axiosInstance?: AxiosInstance;

    /**
     * Options for the retrived endpoint metadata
     */
    metadata?: MetadataOptions;
}

/**
 * Wrap a crs endpoint connection.
 * 
 * Provide the crs endpoint metadata, the ambiant values and the {@link CommandEmitter} for the endpoint.<br>
 * Each new  CrsEndpoint instance must call the connect method in order to initialize the endpoint.<br>
 * During the initialization phase, the CrsEndppoint will fetch the endpoint metadata to get information like the ambiant values, 
 * version number, etc. and try to establish a signalR connection
 */
export class CrsEndpoint<TResponse extends CommandResponse = CommandResponse> {
    metadata: EndpointMetadata;
    readonly endpoint: string;
    protected ambiantValuesProvider: AmbiantValuesProvider;
    protected _emitter: CommandEmitter<TResponse>;
    protected _cmdSender: AxiosCommandSender;
    protected _configuration: CrsEndpointConfiguration;
    private _pendingCommands: Array<{
        command: Object,
        resolver: (response: any) => void,
        rejector: (error: any) => void
    }> = [];

    constructor(endpoint: string)
    constructor(endpoint: string, config: CrsEndpointConfiguration)
    constructor(endpoint: string, config?: CrsEndpointConfiguration) {
        this.endpoint = endpoint;
        this._configuration = {
            metadata: { ...defaultMetadataOptions },
            axiosInstance: http,
            ...config
        };
        this.ambiantValuesProvider = new AmbiantValuesProvider();

        this._cmdSender = new AxiosCommandSender(this._configuration.axiosInstance);
        this._emitter = new BasicCommandEmitter(
            this.endpoint,
            this._cmdSender,
            this.ambiantValuesProvider
        );
    }

    /**
     * Initialize the endpoint connection
     */
    async connect(): Promise<void> {
        const reader = new FetchMetadataReader(this._configuration.axiosInstance);
        const resp = await reader.read(this.endpoint, this._configuration.metadata);

        this.metadata = resp.payload;
        this.ambiantValuesProvider.setValues(this.metadata.ambientValues);
        this._cmdSender.setConnectionIdPropertyName(this.metadata.callerIdPropertyName);
        this.sendPendingCommands();
    }

    /**
     * Send a command through the endpoint
     * @param command The command to send
     */
    send<T>(command: Object): Promise<T> {
        if (this.isConnected) {
            return this.emitter.emit<T>(command)
                .then(resp => resp.payload);
        }

        return new Promise<T>((resolve, reject) => {
            this._pendingCommands.push({ command, resolver: resolve, rejector: reject });
        });
    }

    private sendPendingCommands(): void {
        this._pendingCommands.forEach(pending => {
            this._emitter.emit<any>(pending.command)
                .then(resp => {
                    pending.resolver(resp.payload);
                })
                .catch(e => pending.rejector(e));
        });
    }

    /**
     * The endpoint {CommandEmitter}
     * @returns {BasicCommandEmitter}
     */
    get emitter(): BasicCommandEmitter {
        return this._emitter;
    }

    /**
     * Get the endpoint version
     */
    get version(): number {
        return this.metadata ? this.metadata.version : undefined;
    }

    /**
     * Get the endpoint configured ambient values
     */
    get ambientValues(): { [ambiantValue: string]: any } {
        return this.metadata ? this.metadata.ambientValues : undefined;
    }

    /**
     * True when the connection is successfull. Will always be false if the connected method is not called
     */
    get isConnected(): boolean {
        return !!this.metadata;
    }
}
