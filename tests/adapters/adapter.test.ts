import { describe, expect, test, vi } from 'vitest';
import { Adapter } from '../../src/adapters/adapter';

class MockAdapter extends Adapter {
    sendCalled = false;

    connect() {
        this.isConnected.value = true;
    }

    disconnect() {
        this.isConnected.value = false;
    }

    send(message: string) {
        this.sendCalled = true;
    }

    _processReceivedMessage(message: string) {
        this.processReceivedMessage(message);
    }
}

const testMsg = JSON.stringify({ topic: 'test', message: 'hello' });

describe('Adapter', () => {
    test('publish', () => {
        const adapter = new MockAdapter();

        adapter.publish('test', 'hello');
    })

    test('subscribe to topic', () => {
        const adapter = new MockAdapter();

        const cb = vi.fn((msg: string) => {
            expect(msg).toBe('hello');
        })

        adapter.subscribe('test', cb);

        adapter._processReceivedMessage(testMsg);

        expect(cb).toHaveBeenCalledOnce();
        expect(cb).toHaveBeenCalledWith('hello');
    })

    test('unsubscribe from topic', () => {
        const adapter = new MockAdapter();

        const cb = vi.fn((msg: string) => {
            expect(msg).toBe('hello');
        })

        const id = adapter.subscribe('test', cb);

        adapter.unsubscribe('test');

        adapter._processReceivedMessage(testMsg);

        expect(cb).toHaveBeenCalledTimes(0);
    })
})
