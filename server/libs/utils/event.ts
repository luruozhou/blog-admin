import { StringMap, UniqueObjectArray } from './helpers';

export interface EventListener<T> {
    (event: Event): T;
}

export interface Event {
    type?: string;
}

export class EventEmitter {
    private events = new StringMap<UniqueObjectArray<EventListener<any>>>();
    private onceEvents = new StringMap<UniqueObjectArray<EventListener<any>>>();

    on(type: string, listener: EventListener<any>) {
        var listeners = this.events.get(type);

        if (!listeners) {
            listeners = new UniqueObjectArray<EventListener<any>>();
            this.events.set(type, listeners);
        }

        listeners.add(listener);
    }

    once(type: string, listener: EventListener<any>) {
        var listeners = this.events.get(type);

        if (listeners) {
            listeners.remove(listener);
        }

        listeners = this.onceEvents.get(type);

        if (!listeners) {
            listeners = new UniqueObjectArray<EventListener<any>>();
            this.onceEvents.set(type, listeners);
        }

        listeners.add(listener);
    }

    off(type: string, listener: EventListener<any>) {
        var listeners = this.events.get(type);

        if (listeners) {
            listeners.remove(listener);
        }

        listeners = this.onceEvents.get(type);

        if (listeners) {
            listeners.remove(listener);
        }
    }

    protected trigger(type: string, data?: any): boolean {
        if (!(data instanceof Object)) {
            data = {};
        }

        data['type'] = type;

        var listeners = this.events.get(type);
        var onceListeners = this.onceEvents.get(type);

        var listenersArray: EventListener<any>[] = [];

        if (listeners) {
            listenersArray = listenersArray.concat(listeners.toArray());
        }

        if (onceListeners) {
            listenersArray = listenersArray.concat(onceListeners.toArray());
            this.onceEvents.remove(type);
        }

        return listenersArray
            .every(listener => listener.call(this, data) !== false);
    }

    //@author lion
    protected fireEvent(type: string, ...args: any[]): boolean {

        var listeners = this.events.get(type);
        var onceListeners = this.onceEvents.get(type);

        var listenersArray: EventListener<any>[] = [];

        if (listeners) {
            listenersArray = listenersArray.concat(listeners.toArray());
        }

        if (onceListeners) {
            listenersArray = listenersArray.concat(onceListeners.toArray());
            this.onceEvents.remove(type);
        }

        return listenersArray
            .every(listener => listener.apply(this, args) !== false);
    }
}
