function recordHandlerDelegateFactory<V, R>(handlers: { [_: number]: IRecordHandlerFunction<V, R> }, defaultValue?:R): IRecordHandlerFunction<IRecord<V>, R> {
    var f = function (r: IRecord<V>, ...args: any[]) {
        let result: R;
        var handler = handlers[r.type];
        if (handler) {
            // TODO can we just call handler(r.value, args)?
            args.splice(0, 0, r.value);
            result = handler.apply(r, args);
        } else {
            result = defaultValue;
        }
        return result;
    };
    return f;
}
