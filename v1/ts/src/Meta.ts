import { CommandResponse } from  './Response'

export interface CommandMeta {
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

export interface CrsMeta {
    version: number;
    ambientValues: {[ambiantValue: string]: any};
    commands: {[commandName: string]: CommandMeta};
}

export class MetaResponse extends CommandResponse {
    payload: CrsMeta;
}
