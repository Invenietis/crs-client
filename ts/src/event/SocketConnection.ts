export enum ConnectionStatus {
    connected = 'connect',
    disconnected = 'disconnected'
}

export interface SocketConnection {
    readonly connectionId: string;
    readonly status: ConnectionStatus;

    onConnected(callback: () => void);
    onDisconnected(callback: () => void);
    onResult(callback: (data: any) => void);
    getResultFor(commandId: string): Promise<any>;

    open();
    close();
}
