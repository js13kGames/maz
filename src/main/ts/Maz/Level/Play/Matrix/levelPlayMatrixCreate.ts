function levelPlayMatrixCreate<T>(width: number, height: number, createFunction:()=>T): ILevelPlayMatrix<T> {

    let tiles: T[][] = [];
    for (let x = 0; x < width; x++) {
        let tilesX: T[] = [];
        for (let y = 0; y < height; y++) {
            let tilesY: T = createFunction();
            tilesX.push(tilesY);
        }
        tiles.push(tilesX);
    }

    return {
        width: width,
        height: height,
        tiles: tiles
    };
}