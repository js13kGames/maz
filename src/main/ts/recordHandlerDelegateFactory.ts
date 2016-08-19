import {IRecord} from 'IRecord';
import {IRecordHandlerFunction} from 'IRecordHandlerFunction';

export function recordHandlerDelegateFactory<V, R>(handlers: { [_: number]: IRecordHandlerFunction<V, R> }): IRecordHandlerFunction<IRecord<V>, R> {
    var f = function (r: IRecord<V>, ...args: any[]) {
        var handler = handlers[r.type];
        args.splice(0, 0, r.value);
        return handler.apply(r, args);
        // TODO can we just call handler(r.value, args)?
    };
    return f;
}