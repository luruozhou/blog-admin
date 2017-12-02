export interface Dictionary<T> {
    [key: string]: T;
}

export interface TimeRange {
    start: string;
    end: string;
}
