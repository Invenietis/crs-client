export const MetadataPath = "__meta";
import { CommandResponse } from  './CommandResponse'

export interface CommandMetadata {
    commandType: string;
    route: {
        fullPath: string,
        prefix: string,
        commandName: string
    };
    traits: string;
    descriptions: string;
    parameters: Array<{
        parameterName: string,
        parameterType:string,
        isAmbientValue: boolean
    }>
}

export interface EndpointMetadata {
    version: number;
    ambientValues: {[ambiantValue: string]: any};
    commands?: {[commandName: string]: CommandMetadata};
}

export interface EndpointMetadataResponse extends CommandResponse {
    payload: EndpointMetadata;
}
