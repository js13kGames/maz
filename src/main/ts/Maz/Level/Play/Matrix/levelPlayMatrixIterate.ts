function levelPlayMatrixIterate<T>(matrix: ILevelPlayMatrix<T>, tileSize: number, bounds: IRectangle, f: (a?:T) => T) {
    let minTilex = Math.max(0, Math.floor(bounds.x / tileSize));
    let maxTilex = Math.min(matrix.width-1, Math.floor((bounds.x + bounds.width - 1) / tileSize));
    let minTiley = Math.max(0, Math.floor(bounds.y / tileSize));
    let maxTiley = Math.min(matrix.height-1, Math.floor((bounds.y + bounds.height - 1) / tileSize));
    for (let tilex = minTilex; tilex <= maxTilex; tilex++) {
        let tilesx = matrix.tiles[tilex];
        for (let tiley = minTiley; tiley <= maxTiley; tiley++) {
            let tilesxy = tilesx[tiley];
            tilesx[tiley] = f(tilesxy);
        }
    }
}