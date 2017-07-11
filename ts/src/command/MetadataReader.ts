import { MetadataPath, EndpointMetadataResponse } from './EndpointMetadata';

export interface MetadataReader {
    read(endpoint: string, showCommands: boolean): Promise<EndpointMetadataResponse>;
}

export class FetchMetadataReader implements MetadataReader {
    read(endpoint: string, showCommands = false): Promise<EndpointMetadataResponse> {
        const url = `${endpoint}/${MetadataPath}`;
        return fetch(url, {
            method: 'post',
            credentials: 'include',
            mode: 'cors',
            headers: new Headers(
                {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            ),
            body: JSON.stringify({showCommands})
        }).then( resp => resp.json());
    }
}
