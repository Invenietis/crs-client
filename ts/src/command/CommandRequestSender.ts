import { CommandResponse } from './CommandResponse';
export interface CommandRequestSender {
    send: (url: string, body: any) => Promise<CommandResponse>;
}

export class FetchCommandSender implements CommandRequestSender {
    send(url: string, body: any): Promise<CommandResponse> {
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
            body: JSON.stringify(body)
        }).then( resp => resp.json());
    }
}
