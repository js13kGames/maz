import {IRecord} from 'IRecord';

export interface IRecordHandlerFunction<V, R> {
    (r: IRecord<V>, ...args: any[]): R;
}