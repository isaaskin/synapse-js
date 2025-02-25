type SubId = number;
type Callback<T> = (value: T) => void;

export interface Observer<T> {
    subscribe(callback: Callback<T>): SubId;
    unsubscribe(id: SubId): void;
}

export default class Event<T> implements Observer<T> {
    protected observers: Map<SubId, Callback<T>> = new Map();
    protected observerId: SubId = 0;

    constructor() {
    }

    subscribe(callback: Callback<T>): SubId {
        this.observers.set(this.observerId, callback);
        return this.observerId++;
    }

    unsubscribe(id: SubId) {
        this.observers.delete(id);
    }

    notify(data: T) {
        this.observers.forEach(observer => observer(data));
    }

    observe(): Observer<T> {
        return this;
    }
}
