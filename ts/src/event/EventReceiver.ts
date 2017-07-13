import { SocketConnection, ConnectionStatus } from './SocketConnection';

export class EventReceiver {
    listeners: Map<string, Array<(...args: any[]) => void>>;

    constructor(private connection: SocketConnection) {
        this.listeners = new Map();
        if (this.connection.status === ConnectionStatus.disconnected ) {
            connection.open();
        }
        connection.onMessage( e => {
            const listeners = this.listeners.get(e.name);
            if (listeners) {
                listeners.forEach( listener => {
                    listener(e);
                });
            }
        });
    }

    on(enventName: string, listener: (event: any) => void) {
        const listeners = this.listeners.get(enventName) || [];
        listeners.push(listener);
        this.listeners.set(enventName, listeners);
    }
}
