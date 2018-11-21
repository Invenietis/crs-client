import { MetadataPath, EndpointMetadataResponse } from './EndpointMetadata';
import { AxiosInstance } from 'axios';

export interface MetadataReader {
    read(endpoint: string, options: MetadataOptions): Promise<EndpointMetadataResponse>;
}

export interface MetadataOptions {
    /**
     * Get the command list from the metadata
    */
    showCommands?: boolean;
    /**
     * Get the configured ambient values
    */
    showAmbientValues?: boolean;
}

export const defaultMetadataOptions: MetadataOptions = {
    showAmbientValues: true,
    showCommands: false
};

export class FetchMetadataReader implements MetadataReader {
    constructor(private http: AxiosInstance) { }

    read(endpoint: string, options: MetadataOptions = defaultMetadataOptions): Promise<EndpointMetadataResponse> {
        const url = `${endpoint}/${MetadataPath}`;
        return this.http.post(url, options).then(resp => resp.data);
    }
}
