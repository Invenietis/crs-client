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

export class CommandEmitterProxy extends CommandEmitter {
    private pendingCommands: Array<{
        command: Object,
        resolve: (resp: CommandResponse) => void,
        reject: (reason?: any) => void
    }> = [];
    private isReady: boolean = false;

    constructor(endpoint: string, requestSender: CommandRequestSender, ambiantValues: AmbiantValuesProvider) {
        super(endpoint, requestSender, ambiantValues);
    }
    
    ready() {
        this.pendingCommands.forEach( pending => {
            super.emit(pending.command)
                .then( resp => pending.resolve(resp))
                .catch( e => pending.reject(e));
        });
        this.isReady = true;
    }

    emit<T extends Object>(command: T): Promise<CommandResponse> {
        if (this.isReady) {
            return super.emit(command);
        }

        return new Promise<CommandResponse>((resolve, reject) => {
            this.pendingCommands.push({command, resolve, reject});
        });
    }
}