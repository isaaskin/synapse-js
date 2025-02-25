import { Logger, LogLevel } from '../logger';
import State from '../state';

export interface IAdapter {
    connect(): void;
    disconnect(): void;
    publish(topic: string, message: string): void;
    subscribe(topic: string, callback: (message: string) => void): void;
    unsubscribe(topic: string): void;
} 

export abstract class Adapter implements IAdapter {
    private subscriptions: Map<string, any> = new Map();
    protected isConnected: State<boolean> = new State<boolean>(false);

    abstract connect(): void;
    abstract disconnect(): void;

    protected abstract send(message: string): void;

    constructor(private _logger: Logger = new Logger('Adapter')) {}

    publish(topic: string, message: string) {
        if (!this.isConnected.value) {
            this._logger.log(`Not connected to server`, LogLevel.ERROR);
            return;
        }

        // TODO validate topic name

        const payload = JSON.stringify({ topic, message });
        this.send(payload);
    }

    subscribe(topic: string, callback: any) {
        if (this.subscriptions.has(topic)) {
            this._logger.log(`Subscriber already exists for topic: ${topic}`, LogLevel.WARN);
            return;
        }
        this.subscriptions.set(topic, callback);
    }

    unsubscribe(topic: string) {
        if (!this.subscriptions.has(topic)) {
            this._logger.log(`No subscriber found for topic: ${topic}`, LogLevel.WARN);
            return;
        }
        this.subscriptions.delete(topic);
    }

    protected processReceivedMessage(message: string) {
        this._logger.log(`Processing message: ${message}`, LogLevel.DEBUG);

        try {            
            const messageObj = JSON.parse(message);

            if (!('topic' in messageObj)) {
                this._logger.log('Invalid message format: Missing topic', LogLevel.ERROR);
                return;
            }

            // TODO: Validate if topic is valid
            if (!('message' in messageObj)) {
                this._logger.log('Invalid message format: Missing message', LogLevel.ERROR);
                return;
            }

            this.notifySubscriber(messageObj.topic, messageObj.message);
        } catch (error) {
            this._logger.log('Invalid message format: Invalid JSON', LogLevel.ERROR);
            return;
        }
    }

    private notifySubscriber(topic: string, message: any) {
        if (this.subscriptions.has(topic)) {
            this.subscriptions.get(topic)(message);
            return;
        }

        this._logger.log(`No subscriber found for topic: ${topic}`, LogLevel.WARN);
    }
}
