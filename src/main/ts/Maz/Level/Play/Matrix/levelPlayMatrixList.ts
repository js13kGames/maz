function levelPlayMatrixList<T>(matrix: ILevelPlayMatrix<T[]>, tileSize: number, bounds: IRectangle) {
    let result: T[] = [];
    levelPlayMatrixIterate(matrix, tileSize, bounds, function (a: T[]) {
        for (let e of a) {
            if (!arrayContains(result, e)) {
                result.push(e);
            }
        }
        return a;
    });
    return result;
}