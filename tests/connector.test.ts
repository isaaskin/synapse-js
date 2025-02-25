import { beforeEach, describe, expect, test, vi } from "vitest";

import { Adapter } from "../src/adapters/adapter";
import Connector from "../src/connector";

class MockAdapter extends Adapter {
    protected send(message: string): void {}

    connect = vi.fn();
    disconnect = vi.fn();

    _processReceivedMessage(message: string): void {
        this.processReceivedMessage(message);
    }
}

const stateTestMsg = JSON.stringify({ topic: 'state/test', message: JSON.stringify('hello') });
const eventTestMsg = JSON.stringify({ topic: 'event/test', message: JSON.stringify('hello') });

const stateCb = vi.fn((data: any) => {
    expect(data).toBe('hello');
});

const eventCb = vi.fn((data: any) => {
    expect(data).toBe('hello');
});

describe('Connector', () => {
    let adapter: MockAdapter;
    let connector: Connector;

    beforeEach(() => {
        vi.clearAllMocks()

        adapter = new MockAdapter();
        connector = new Connector(adapter);
    })

    test('should connect to/disconnect from adapter', () => {
        connector.connect();

        expect(adapter.connect).toHaveBeenCalledOnce();

        connector.disconnect();

        expect(adapter.disconnect).toHaveBeenCalledOnce();
    })

    test('state subscription', () => {
        connector.subscribeToState('test', stateCb);

        adapter._processReceivedMessage(stateTestMsg);

        expect(stateCb).toHaveBeenCalledOnce();
    });

    test('event subscription', () => {
        connector.subscribeToEvent('test', eventCb);

        adapter._processReceivedMessage(eventTestMsg);

        expect(eventCb).toHaveBeenCalledOnce();
    })
})
