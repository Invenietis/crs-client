import { MetaResponse } from './Meta'

export const MetaEndpoint = "__meta";

export interface MetaProvider{
    load(): Promise<MetaResponse>;
}

export class HttpMetaProvider implements MetaProvider {
    public url: string;
    
    constructor(public uriBase: string) {
        this.url = this.uriBase + (this.uriBase[this.uriBase.length - 1] == '/' ? '' : '/') +  MetaEndpoint;
    }
    
    load(): Promise<MetaResponse> {
         return new Promise((resolve, reject)=> {
             $.ajax(this.url, {
                method: 'POST',
                contentType: 'application/json',
                dataType: 'JSON'
             }).then((data) => resolve(data), reject);
         })
     }

}