import { IAdapter } from "./adapters/adapter";
import { Logger, LogLevel } from "./logger";

type Callback = (data: any) => void;

export interface IConnector {
    connect(): void;
    disconnect(): void;
    sendCommand(name: string, payload: any, timeoutMs: number): Promise<any>;
    subscribeToState(name: string, callback: Callback): void;
    subscribeToEvent(name: string, callback: Callback): void;
}

export default class Connector implements IConnector {
    private commandCorrelationId: number = 0;
    private awatingCommandResponses: Map<number, any> = new Map();

    constructor(private adapter: IAdapter, private logger: Logger = new Logger('Connector')) {
        this.adapter.subscribe('command/response', (message: string) => {
            const messageObj = JSON.parse(message);

            if (!('correlation_id' in messageObj)) {
                this.logger.log('Invalid command response: Missing correlation ID', LogLevel.ERROR);
                return;
            }

            const { correlation_id } = messageObj;

            if (!this.awatingCommandResponses.has(correlation_id)) {
                this.logger.log(`No command response handler found for correlation ID: ${correlation_id}. The command might have timed out.`);
                return;
            }

            const payloadObj = JSON.parse(messageObj.payload);

            this.awatingCommandResponses.get(correlation_id)(payloadObj);
            this.awatingCommandResponses.delete(correlation_id);
        });
    }

    connect() {
        this.adapter.connect();
    }

    disconnect() {
        this.adapter.disconnect();
    }

    subscribeToState(name: string, callback: Callback) {
        this.adapter.subscribe(`state/${name}`, (message: string) => {
            this.handlePayload(name, message, callback);
        });
    }

    subscribeToEvent(name: string, callback: Callback) {
        this.adapter.subscribe(`event/${name}`, (message: any) => {
            this.handlePayload(name, message, callback);
        });
    }

    sendCommand(name: string, payload: any, timeoutMs: number = 30000): Promise<any> {
        const message = {
            correlation_id: this.commandCorrelationId++,
            payload
        };

        this.adapter.publish(`command/${name}`, JSON.stringify(message));

        return new Promise((resolve, reject) => {
            this.awatingCommandResponses.set(message.correlation_id, resolve);

            setTimeout(() => {
                if (!this.awatingCommandResponses.has(message.correlation_id)) {
                    return;
                }

                this.awatingCommandResponses.delete(message.correlation_id);
                reject(`Command ${name} timed out after ${timeoutMs} second${timeoutMs > 1 ? 's' : ''}`);
            }, timeoutMs);
        });
    }

    private handlePayload(name: string, message: string, callback: Callback) {
        try {
            const messageObj = JSON.parse(message);
            callback(messageObj);
        } catch (error) {
            this.logger.log(`Error deserializing ${name}: ${error}`, LogLevel.ERROR);
            return;
        }
    }
}
