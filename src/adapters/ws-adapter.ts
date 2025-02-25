import { Logger, LogLevel } from '../logger';
import { Adapter } from './adapter';

export default class WSAdapter extends Adapter {
    private ws?: WebSocket;

    constructor(private host: string = 'localhost',
        private port: number = 8765,
        private isSecure: boolean = false,
        private logger: Logger = new Logger('WSAdapter')) {
        super();
    }

    connect() {
        if (this.isConnected.value) {
            this.logger.log('Already connected', LogLevel.WARN);
            return;
        }

        this.ws = new WebSocket(`${this.isSecure ? 'wss' : 'ws'}://${this.host}:${this.port}`);

        this.ws.onopen = () => {
            this.isConnected.value = true;
            this.logger.log('Connected', LogLevel.INFO);
        };

        this.ws.onmessage = (event) => {
            this.processReceivedMessage(event.data);
        };

        this.ws.onclose = () => {
            this.isConnected.value = false;
        };
    }

    disconnect() {
        if (!this.ws) {
            this.logger.log('[WSAdapter] Not connected to server', LogLevel.WARN);
            return;
        }

        this.ws.close();
        this.isConnected.value = false;
    }

    protected send(message: string): void {
        if (!this.ws) {
            this.logger.log('[WSAdapter] Cannot send message: Not connected to server', LogLevel.ERROR);
            return;
        }

        this.ws.send(message);
    }
}
