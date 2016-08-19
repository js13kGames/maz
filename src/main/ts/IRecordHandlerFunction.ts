export interface IRecordHandlerFunction<V, R> {
    (r: V, ...args: any[]): R;
}