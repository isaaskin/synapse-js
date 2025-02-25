import { describe, expect, test, vi, beforeEach } from 'vitest';
import State from '../src/state';


describe('State', () => {
    test('initial value', () => {
        const state = new State(0);
        expect(state.value).toBe(0);
    });

    test('set new value', () => {
        const state = new State(0);
        state.value = 1;
        expect(state.value).toBe(1);
    });

    test('observe initial value', () => {
        const state = new State(0);
        const observer = state.observe();
        expect(observer.value).toBe(0);
    });

    test('observe new value', () => {
        const state = new State(0);
        state.value = 1;
        const observer = state.observe();
        expect(observer.value).toBe(1);
    });

    test('subscribe to state', () => {
        const state = new State(0);
        const observer = vi.fn((value: number) => {
            expect(value).toBe(1);
        });
        state.observe().subscribe(observer);
        state.value = 1;
        expect(observer).toHaveBeenCalledOnce();
        expect(observer).toHaveBeenCalledWith(1);
    });

    test('unsubscribe from state', () => {
        const state = new State(0);

        const mockCallback = vi.fn((value: number) => {
            expect(value).toBe(1);
        });

        const id = state.observe().subscribe(mockCallback);
        state.value = 1;
        expect(mockCallback).toHaveBeenCalledOnce();
        expect(mockCallback).toHaveBeenCalledWith(1);

        state.observe().unsubscribe(id);
        state.value = 2;
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('setting the same value should not call the observer', () => {
        const state = new State(0);
        const observer = vi.fn((value: number) => {
            expect(value).toBe(1);
        });
        state.observe().subscribe(observer);
        state.value = 1;
        expect(observer).toHaveBeenCalledTimes(1);
        state.value = 1;
        expect(observer).toHaveBeenCalledTimes(1);
    });
});
