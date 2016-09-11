function mapCopy<V>(map: { [_: number]: V } | { [_: string]: V }): { [_: number]: V } | { [_: string]: V } {
    let result = {};
    for (let key in map) {
        let value = map[key];
        result[key] = value;
    }
    return <any>result;
}