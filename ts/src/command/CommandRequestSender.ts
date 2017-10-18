import { CommandResponse } from './CommandResponse';
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

export class FetchCommandSender implements CommandRequestSender {
    private _connectionIdPropertyName: string;

    send(url: string, body: any, connectionId?: string): Promise<CommandResponse<any>> {
        const query = {
            [this._connectionIdPropertyName]: connectionId
        };

        return fetch(`${url}${connectionId ? ('?' + serialize(query)) : ''}`, {
            method: 'post',
            credentials: 'include',
            mode: 'cors',
            headers: new Headers(
                {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            ),
            body: JSON.stringify(body)
        }).then(resp => resp.json());
    }

    setConnectionIdPropertyName(queryString: string) {
        this._connectionIdPropertyName = queryString;
    }
}
