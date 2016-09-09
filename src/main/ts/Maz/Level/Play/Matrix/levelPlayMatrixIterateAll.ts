function levelPlayMatrixIterateAll<T>(matrix: ILevelPlayMatrix<T>, f: (value: T, x: number, y: number) => T) {
    for (let x = matrix.width; x > 0;) {
        x--;
        let tilesX = matrix.tiles[x];
        for (let y = matrix.height; y > 0; ) {
            y--;
            let tilesXY = tilesX[y];
            let t = f(tilesXY, x, y);
            tilesX[y] = t;
        }
    }
}