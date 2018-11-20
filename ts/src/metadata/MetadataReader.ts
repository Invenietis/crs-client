import { MetadataPath, EndpointMetadataResponse } from './EndpointMetadata';
import http from 'axios';

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
    read(endpoint: string, options: MetadataOptions = defaultMetadataOptions): Promise<EndpointMetadataResponse> {
        const url = `${endpoint}/${MetadataPath}`;
        return http.post(url, options).then(resp => resp.data);
    }
}
