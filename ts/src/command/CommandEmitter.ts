import { CommandRequestSender } from './CommandRequestSender';
import { AmbiantValuesProvider } from './AmbiantValuesProvider';
import { readCommandName } from './Command';
import { CommandResponse } from './CommandResponse';

export class CommandEmitter {
    readonly endpoint: string;
    readonly sender: CommandRequestSender;
    readonly ambiantValues: AmbiantValuesProvider;

    constructor(endpoint: string, requestSender: CommandRequestSender, ambiantValues: AmbiantValuesProvider) {
        this.endpoint = endpoint;
        this.sender = requestSender;
        this.ambiantValues = ambiantValues;
    }

    emit<T extends Object>(command: T): Promise<CommandResponse> {
        const commandName = readCommandName(command);
        const url = `${this.endpoint}/${commandName}`;
        const commandWithAV = this.ambiantValues.merge(command);
        const response = this.sender.send(url, commandWithAV);
        return response;
    }
}
