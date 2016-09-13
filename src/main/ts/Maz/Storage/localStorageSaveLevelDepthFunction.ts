let localStorageSaveLevelDepthFunction: IStorageSaveLevelDepthFunction = function (x: number, y: number, depth: number) {
    let key = toStringWithSign(x) + toStringWithSign(y);
    localStorage.setItem(key, ""+depth);
}