import Event from './event';
import { Observer } from './event';

import isEqual from 'lodash/isEqual';

interface StateObserver<T> extends Observer<T> {
    get value(): T;
}

export default class State<T> extends Event<T> implements StateObserver<T> {
    private _state: T;

    constructor(initialState: T) {
        super();
        this._state = initialState;
    }

    get value(): T {
        return this._state;
    }

    set value(newState: T) {
        if (isEqual(this._state, newState)) return;

        this._state = newState;
        this.notify(newState);
    }

    observe(): StateObserver<T> {
        return this;
    }
}
