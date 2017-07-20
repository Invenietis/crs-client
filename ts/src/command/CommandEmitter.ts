import { AmbiantValuesProvider } from '../metadata/AmbiantValuesProvider';
import { readCommandName, readCommandEvents } from './Command';
import { CommandResponse } from './CommandResponse';
import { EventReceiver } from '../event/EventReceiver';
import { Observable, Subscriber } from 'rxjs/Rx';
import { CommandRequestSender } from './CommandRequestSender';

/**
 * Base class to emit commands
 */
export class CommandEmitter {
    readonly endpoint: string;
    readonly sender: CommandRequestSender;
    readonly ambiantValues: AmbiantValuesProvider;

    constructor(endpoint: string, requestSender: CommandRequestSender, ambiantValues: AmbiantValuesProvider) {
        this.endpoint = endpoint;
        this.sender = requestSender;
        this.ambiantValues = ambiantValues;
    }

    emit<T>(command: Object): Observable<CommandResponse<T>> {
        const commandName = readCommandName(command);
        const url = `${this.endpoint}/${commandName}`;
        const commandWithAV = this.ambiantValues.merge(command);
        const response = this.sender.send(url, commandWithAV);
        return Observable.from(response);
    }
}

/**
 * Emitter that enqueue the emitted commands until the endpoint is ready
 */
export class CommandEmitterProxy extends CommandEmitter {
    private pendingCommands: Array<{
        command: Object,
        subscriber: Subscriber<CommandResponse<any>>
    }> = [];
    private isReady: boolean = false;

    constructor(endpoint: string, requestSender: CommandRequestSender, ambiantValues: AmbiantValuesProvider) {
        super(endpoint, requestSender, ambiantValues);
    }

    ready() {
        this.pendingCommands.forEach(pending => {
            super.emit<any>(pending.command)
                .subscribe(resp => {
                     pending.subscriber.next(resp);
                });
        });
        this.isReady = true;
    }

    emit<T>(command: Object): Observable<CommandResponse<T>> {
        if (this.isReady) {
            return super.emit(command);
        }

        return new Observable<CommandResponse<T>>(subscriber => {
            this.pendingCommands.push({ command, subscriber });
        });
    }
}

export enum EventType {
    CommandResponse = 'CommandResponse',
    Event = 'Event'
}

/**
 * Emitter that subscribe on the command events specified with {Command}
 */
export class CommandEmitterSubscriber extends CommandEmitterProxy {
    readonly receiver: EventReceiver;

    constructor(
        endpoint: string,
        requestSender: CommandRequestSender,
        ambiantValues: AmbiantValuesProvider,
        eventReceiver: EventReceiver
    ) {
        super(endpoint, requestSender, ambiantValues);
        this.receiver = eventReceiver;
    }

    emit<T>(command: Object): Observable<CommandResponse<T>> {
        const events = readCommandEvents(command);
        return super.emit<T>(command)
            .merge(new Observable<any>(subscriber => {
            if (this.receiver) {
                const callback = event => {
                    subscriber.next(event);
                };
                events.forEach(e => this.receiver.on(e, callback));
            }
        }));
    }
}
