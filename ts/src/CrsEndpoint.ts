import {
    SignalRConnection,
    SocketConnection
} from './event';
import {
    CommandEmitter,
    CommandEmitterProxy,
    AxiosCommandSender,
} from './command';
import {
    EndpointMetadata,
    AmbiantValuesProvider,
    FetchMetadataReader,
    MetadataOptions,
    defaultMetadataOptions
} from './metadata';
import http, { AxiosInstance } from 'axios';

const DEFAULT_WS_PATH = 'crs';

export interface CrsEndpointConfiguration {
    /**
     * Override the default Axios instance used by the {@link AxiosCommandSender}
     * @see https://github.com/axios/axios#creating-an-instance
     */
    axiosInstance?: AxiosInstance;

    /**
     * The url to the CRS endpoint if needed
     */
    wsUrl?: string;

    /**
     * Use the SignalR connection. If true, must be configured on the remote CRS
     */
    useSignalR?: boolean;

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
export class CrsEndpoint {
    metadata: EndpointMetadata;
    readonly endpoint: string;
    private ambiantValuesProvider: AmbiantValuesProvider;
    private _emitter: CommandEmitterProxy;
    private _connection: SocketConnection;
    private _cmdSender: AxiosCommandSender;
    private _configuration: CrsEndpointConfiguration;

    constructor(endpoint: string)
    constructor(endpoint: string, config: CrsEndpointConfiguration)
    constructor(endpoint: string, config?: CrsEndpointConfiguration) {
        this.endpoint = endpoint;
        this._configuration = {
            wsUrl: `/${DEFAULT_WS_PATH}`,
            metadata: { ...defaultMetadataOptions },
            axiosInstance: http,
            ...config
        };
        this.ambiantValuesProvider = new AmbiantValuesProvider();
        if (this._configuration.useSignalR) {
            this._connection = new SignalRConnection(this._configuration.wsUrl);
        }
        this._cmdSender = new AxiosCommandSender(this._configuration.axiosInstance);
        this._emitter = new CommandEmitterProxy(
            this.endpoint,
            this._cmdSender,
            this.ambiantValuesProvider,
            this._connection
        );
    }

    /**
     * Initialize the endpoint connection
     */
    connect(): Promise<void> {
        const reader = new FetchMetadataReader(this._configuration.axiosInstance);
        let socketCnx = Promise.resolve();
        if (this._connection) {
            socketCnx = this._connection.open();
        }

        return Promise.all([
            socketCnx,
            reader.read(this.endpoint, this._configuration.metadata).then(resp => {
                this.metadata = resp.payload;
                this.ambiantValuesProvider.setValues(this.metadata.ambientValues);
                this._cmdSender.setConnectionIdPropertyName(this.metadata.callerIdPropertyName);
                this._emitter.ready();
            })])
            .then(_ => undefined);
    }

    /**
     * Send a command through the endpoint
     * @param command The command to send
     */
    send<T>(command: Object): Promise<T> {
        return this.emitter.emit<T>(command)
            .then(resp => resp.payload);
    }

    /**
     * The endpoint {CommandEmitter}
     * @returns {CommandEmitter}
     */
    get emitter(): CommandEmitter {
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
