function levelPlayMatrixIterate<T>(matrix: ILevelPlayMatrix<T>, tileSize: number, bounds: IRectangle, f: (a?:T, x?:number, y?:number) => T) {
    let minTilex = max(0, floor(bounds.x / tileSize));
    let maxTilex = min(matrix.width-1, floor((bounds.x + bounds.w - 1) / tileSize));
    let minTiley = max(0, floor(bounds.y / tileSize));
    let maxTiley = min(matrix.height-1, floor((bounds.y + bounds.h - 1) / tileSize));
    for (let tilex = minTilex; tilex <= maxTilex; tilex++) {
        let tilesx = matrix.tiles[tilex];
        for (let tiley = minTiley; tiley <= maxTiley; tiley++) {
            let tilesxy = tilesx[tiley];
            tilesx[tiley] = f(tilesxy, tilex, tiley);
        }
    }
}