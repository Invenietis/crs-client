export enum ConnectionStatus {
    connected = 'connect',
    disconnected = 'disconnected'
}

export interface SocketConnection {
    readonly connectionId: string;
    readonly status: ConnectionStatus;
    
    onConnected(callback: (e: any) => void);
    onDisconnected(callback: (e: any) => void);
    onMessage(callback: (data: any) => void);

    send(data: any);
    
    open();
    close();
}
