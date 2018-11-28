import { AmbiantValuesProvider } from '../metadata/AmbiantValuesProvider';
import { readCommandName } from './Command';
import { CommandResponse, ResponseType } from './CommandResponse';
import { CommandRequestSender } from './CommandRequestSender';

export interface CommandEmitter<TResponse extends CommandResponse> {
    emit(command: Object): Promise<TResponse>;
}

/**
 * Base class to emit CRS commands.
 * Each emitted command must be an instance of a class decorated by the {Command} decorator
 */
export class BasicCommandEmitter implements CommandEmitter<CommandResponse> {
    readonly endpoint: string;
    readonly sender: CommandRequestSender;
    readonly ambiantValues: AmbiantValuesProvider;

    constructor(endpoint: string, requestSender: CommandRequestSender, ambiantValues: AmbiantValuesProvider) {
        this.endpoint = endpoint;
        this.sender = requestSender;
        this.ambiantValues = ambiantValues;
    }

    /**
     * Send the command to the configurated endpoint
     * @param command The command to send. Must be an instance of a class decorated with the {Command} decorator
     * @returns {Promise<CommandResponse>>}
     */
    async emit<T>(command: Object): Promise<CommandResponse<T>> {
        const commandName = readCommandName(command);
        const url = `${this.endpoint}/${commandName}`;
        const commandWithAV = this.ambiantValues.merge(command);
        const connectionId = new Date().getTime().toString();
        const response = await this.sender.send(url, commandWithAV, connectionId);

        if (response.responseType === ResponseType.Asynchronous) {
            console.warn('An asynchronous command was made but the emitter does not support async response handling');
        }
        return response;
    }
}
