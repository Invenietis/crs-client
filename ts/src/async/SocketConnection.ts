import { CommandResponse } from "../command";

export enum ConnectionStatus {
    connected = 'connect',
    disconnected = 'disconnected'
}

export interface SocketConnection {
    readonly connectionId: string;
    readonly status: ConnectionStatus;

    onConnected(callback: () => void): void;
    onDisconnected(callback: () => void): void;
    onResult(callback: (data: any) => void): void;
    getAsyncResult<T>(command: CommandResponse<T>): Promise<T>;
    open(): void;
    close(): void;
}
