import { MetadataPath, EndpointMetadataResponse } from './EndpointMetadata';
import http from 'axios';

export interface MetadataReader {
    read(endpoint: string, showCommands: boolean): Promise<EndpointMetadataResponse>;
}

export class FetchMetadataReader implements MetadataReader {
    read(endpoint: string, showCommands = false): Promise<EndpointMetadataResponse> {
        const url = `${endpoint}/${MetadataPath}`;
        return http.post(url, { showCommands }).then(resp => resp.data);
    }
}
