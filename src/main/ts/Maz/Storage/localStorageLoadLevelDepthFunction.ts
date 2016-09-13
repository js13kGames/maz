let localStorageLoadLevelDepthFunction: IStorageLoadLevelDepthFunction = function (x: number, y: number) {
    let depth = localStorage.getItem(toStringWithSign(x) + toStringWithSign(y));
    let result: number;
    if (depth) {
        result = _parseInt(depth);
    } else {
        result = 0;
    }
    return result;
};