function levelPlayMatrixPopulatorFillerProxyFactory(proxied: ILevelPlayMatrixPopulator): ILevelPlayMatrixPopulator {

    function fill(matrix: ILevelPlayMatrix, point: IPoint) {
        let ignorePoints: boolean[][] = [];
        for (let x = 0; x < matrix.width; x++) {
            let xIgnorePoints: boolean[] = [];
            for (let y = 0; y < matrix.height; y++) {
                xIgnorePoints.push(false);
            }
            ignorePoints.push(xIgnorePoints);
        }

        // flood fill the adjacent ignore points
        floodFillOccupied(ignorePoints, matrix, point.x, point.y);

        // flood fill the empty spaces
        floodFillEmpty(ignorePoints, matrix, point.x, point.y, matrix.tiles[point.x][point.y][0]);
    }

    function floodFillEmpty(ignorePoints: boolean[][], matrix: ILevelPlayMatrix, x: number, y: number, w: ILevelPlayEntityDescription) {
        let count = 0;
        for (let p of POINT_DIRECTIONS_ALL) {
            let xi = x + p.x;
            let yi = y + p.y;
            if (xi >= 0 && xi < matrix.width && yi >= 0 && yi < matrix.height && (ignorePoints[xi][yi] || !matrix.tiles[xi][yi].length)) {
                count++;
            }
        }
        // surrounded by empty spots
        if (count == 8) {
            let tiles = matrix.tiles[x][y];
            if (!tiles.length) {
                tiles.push(w);
                ignorePoints[x][y] = true;
            }
            for (let p of POINT_DIRECTIONS_CARDINAL) {
                let xi = x + p.x;
                let yi = y + p.y;
                if (xi >= 0 && xi < matrix.width && yi >= 0 && yi < matrix.height && !ignorePoints[xi][yi] && !matrix.tiles[xi][yi].length) {
                    floodFillEmpty(ignorePoints, matrix, xi, yi, w);
                }
            }
        }
    }

    function floodFillOccupied(ignorePoints: boolean[][], matrix: ILevelPlayMatrix, x: number, y: number) {
        ignorePoints[x][y] = true;
        for (let p of POINT_DIRECTIONS_CARDINAL) {
            let xi = x + p.x;
            let yi = y + p.y;
            if (xi >= 0 && xi < matrix.width && yi >= 0 && yi < matrix.height && !ignorePoints[xi][yi] && matrix.tiles[xi][yi].length) {
                floodFillOccupied(ignorePoints, matrix, xi, yi);
            }
        }
    }

    return function (matrix: ILevelPlayMatrix, validEntityTypes: IEntityType[], rng: IRandomNumberGenerator) {
        proxied(matrix, validEntityTypes, rng);
        let points: IPoint[] = [];
        for (let x = 0; x < matrix.width; x++) {
            for (let y = 0; y < matrix.height; y++) {
                if (matrix.tiles[x][y].length) {
                    var index = rng(points.length);
                    // make sure it's random
                    points.splice(index, 0, { x: x, y: y });
                }
            }
        }
        for (let point of points) {
            fill(matrix, point);
        }
    }

}