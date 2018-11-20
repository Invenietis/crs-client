import { CommandResponse } from './CommandResponse';
import { AxiosInstance } from 'axios';

export interface CommandRequestSender {
    send: (url: string, body: any, connectionId?: string) => Promise<CommandResponse<any>>;
    setConnectionIdPropertyName(queryString: string);
}

const serialize = function (obj) {
    const str = [];
    for (let p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }

    return str.join("&");
}

/** 
 * Send the command through HTTP using [axios](https://github.com/axios/axios)
*/
export class AxiosCommandSender implements CommandRequestSender {
    private _connectionIdPropertyName: string;

    constructor(
        private _axios: AxiosInstance
    ) {
    }

    send(url: string, body: any, connectionId: string): Promise<CommandResponse<any>> {
        const query = {
            [this._connectionIdPropertyName]: connectionId
        };

        return this._axios.post(`${url}?${serialize(query)}`, body).then(resp => resp.data);
    }

    setConnectionIdPropertyName(queryString: string) {
        this._connectionIdPropertyName = queryString;
    }
}
