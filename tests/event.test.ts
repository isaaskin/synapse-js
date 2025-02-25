import { describe, expect, test, vi } from 'vitest';
import Event from '../src/event';

class MyEvent extends Event<string> {
    constructor() {
        super();
    }

    observerSize(): number {
        return this.observers.size;
    }
}

describe('Event', () => {
    test('subscribe/unsubscribe once', () => {
        const event: MyEvent = new MyEvent();

        const id = event.subscribe(() => { });
        expect(event.observerSize()).toBe(1);
        event.unsubscribe(id);
        expect(event.observerSize()).toBe(0);
    });

    test('subscribe/unsubscribe multiple times', () => {
        const event: MyEvent = new MyEvent();

        const numSubs = 10;

        const ids: number[] = [];
        for (let i = 0; i < numSubs; i++) {
            ids.push(event.subscribe(() => { }));
        }
        expect(event.observerSize()).toBe(numSubs);
        event.notify('hello');

        for (let i = 0; i < numSubs; i++) {
            event.unsubscribe(ids[i]);
        }

        expect(event.observerSize()).toBe(0);
    });

    test('notify once', () => {
        const event: MyEvent = new MyEvent();

        const cb = vi.fn((data: string) => expect(data).toBe('hello'));
        const id = event.subscribe(cb);
        expect(event.observerSize()).toBe(1);
        event.notify('hello');
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith('hello');
        event.unsubscribe(id);
    });

    test('notify after unsubscribe', () => {
        const event: MyEvent = new MyEvent();

        const mockCallback = vi.fn((data: string) => expect(data).toBe('hello'));
        const id = event.subscribe(mockCallback);
        event.notify('hello');
        expect(mockCallback).toHaveBeenCalledTimes(1);
        event.unsubscribe(id);
        event.notify('hello');
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('notify multiple times', () => {
        const event: MyEvent = new MyEvent();

        const numTimes = 10;

        const cb = vi.fn((data: string) => expect(data).toBe('hello'));
        const id = event.subscribe(cb);
        for (let i = 0; i < numTimes; i++) {
            event.notify('hello');
        }
        expect(cb).toHaveBeenCalledTimes(numTimes);
    })

    test('observe', () => {
        const event: MyEvent = new MyEvent();

        const observer = event.observe();
        const cb = vi.fn((data: string) => expect(data).toBe('hello'));
        const id = observer.subscribe(cb);
        expect(event.observerSize()).toBe(1);
        event.notify('hello');
        observer.unsubscribe(id);
        expect(event.observerSize()).toBe(0);
    });
});
