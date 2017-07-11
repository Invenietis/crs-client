import { MetadataPath, EndpointMetadataResponse } from './EndpointMetadata';

export interface MetadataReader {
    read();
}

export class FetchMetadataReader {
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
