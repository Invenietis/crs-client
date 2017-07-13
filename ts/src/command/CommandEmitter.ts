import { CommandRequestSender } from './CommandRequestSender';
import { AmbiantValuesProvider } from '../metadata/AmbiantValuesProvider';
import { readCommandName, readCommandEvents } from './Command';
import { CommandResponse } from './CommandResponse';
import { EventReceiver } from '../event/EventReceiver';
import { Observable } from 'rxjs/Observable';

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

export enum EventType {
    CommandResponse = 'CommandResponse',
    Event = 'Event'
}

export interface EventResult {
    type: EventType;
    data: CommandResponse | any;
}

export class CommandEmitterSubscriber {
    readonly receiver: EventReceiver;
    private emitter: CommandEmitterProxy;

    constructor(
        endpoint: string,
        requestSender: CommandRequestSender,
        ambiantValues: AmbiantValuesProvider,
        eventReceiver: EventReceiver
    ) {
        this.emitter = new CommandEmitterProxy(endpoint, requestSender, ambiantValues);
        this.receiver = eventReceiver;
    }

    ready() {
        this.emitter.ready();
    }

    emit<T extends Object>(command: T): Observable<EventResult> {
        const events = readCommandEvents(command);
        const responsePromise = this.emitter.emit(command);
                
        return new Observable((subscribe) => {    
            const callback = event => {
                subscribe.next({
                    type: EventType.Event,
                    data: event
                });
            };
            events.forEach( e => this.receiver.on(e, callback));
            responsePromise.then( resp => subscribe.next({
                type: EventType.CommandResponse,
                data: resp
            }));
        });
    }
}
