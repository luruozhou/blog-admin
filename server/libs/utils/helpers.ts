
const hop = Object.prototype.hasOwnProperty;

export class StringHash {
    private map: {
        [key: string]: void;
    } = {};

    constructor(keys: string[] = []) {
        for (let key of keys) {
            this.map[key] = null;
        }
    }

    get keys(): string[] {
        return Object.keys(this.map);
    }

    exists(key: string): boolean {
        return hop.call(this.map, key);
    }

    set(key: string) {
        this.map[key] = null;
    }

    unset(key: string) {
        delete this.map[key];
    }

    clear() {
        this.map = {};
    }
}

export class StringMap<T> {
    private map: {
        [key: string]: T;
    } = {};

    get keys(): string[] {
        return Object.keys(this.map);
    }

    exists(key: string): boolean {
        return hop.call(this.map, key);
    }

    get(key: string, defaultValue?: T): T {
        if (hop.call(this.map, key)) {
            return this.map[key];
        } else if (arguments.length > 1) {
            this.map[key] = defaultValue;
            return defaultValue;
        } else {
            return undefined;
        }
    }

    set(key: string, value: T) {
        this.map[key] = value;
    }

    remove(key: string) {
        delete this.map[key];
    }

    clear() {
        this.map = {};
    }
}

export class UniqueObjectArray<T> {
    private items: T[] = [];

    constructor(items: T[] = []) {
        items.forEach(item => {
            this.add(item);
        });
    }

    get length(): number {
        return this.items.length;
    }

    exists(item: T): boolean {
        return this.items.indexOf(item) >= 0;
    }

    add(item: T) {
        if (this.items.indexOf(item) < 0) {
            this.items.push(item);
        }
    }

    remove(item: T) {
        var index = this.items.indexOf(item);

        if (index >= 0) {
            this.items.splice(index, 1);
        }
    }

    toArray(): T[] {
        return this.items;
    }
}
