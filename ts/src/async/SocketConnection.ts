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
    getAsyncResult<T>(commandId: string): Promise<T>;

    open();
    close();
}
