import { SocketConnection, ConnectionStatus } from "./SocketConnection";

export class WebsocketConnection implements SocketConnection {
    connectionId: string = '12354';
    status: ConnectionStatus = ConnectionStatus.connected;

    onConnected(callback: (e: any) => void) {
    }

    onDisconnected(callback: (e: any) => void) {
    }

    onMessage(callback: (data: any) => void) {
    }

    send(data: any) {
        
    }

    open() {
    }

    close() {
    }
}
