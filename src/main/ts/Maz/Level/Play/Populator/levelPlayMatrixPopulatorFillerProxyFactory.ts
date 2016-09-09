function levelPlayMatrixPopulatorFillerProxyFactory(proxied: ILevelPlayMatrixPopulator): ILevelPlayMatrixPopulator {

    function fill(matrix: ILevelPlayMatrix<ILevelPlayEntityDescription[]>, point: IPoint) {
        let ignorePoints = levelPlayMatrixCreate(matrix.width, matrix.height, function () {
            return false;
        });

        // flood fill the adjacent ignore points
        floodFillOccupied(ignorePoints, matrix, point.x, point.y);

        // flood fill the empty spaces
        floodFillEmpty(ignorePoints, matrix, point.x, point.y, matrix.tiles[point.x][point.y][0]);
    }

    function floodFillEmpty(ignorePoints: ILevelPlayMatrix<boolean>, matrix: ILevelPlayMatrix<ILevelPlayEntityDescription[]>, x: number, y: number, w: ILevelPlayEntityDescription) {
        let count = 0;
        for (let p of POINT_DIRECTIONS_ALL) {
            let xi = x + p.x;
            let yi = y + p.y;
            if (xi >= 0 && xi < matrix.width && yi >= 0 && yi < matrix.height && (ignorePoints.tiles[xi][yi] || !matrix.tiles[xi][yi].length)) {
                count++;
            }
        }
        // surrounded by empty spots
        if (count == 8) {
            let tiles = matrix.tiles[x][y];
            if (!tiles.length) {
                tiles.push(w);
                ignorePoints.tiles[x][y] = true;
            }
            for (let p of POINT_DIRECTIONS_CARDINAL) {
                let xi = x + p.x;
                let yi = y + p.y;
                if (xi >= 0 && xi < matrix.width && yi >= 0 && yi < matrix.height && !ignorePoints.tiles[xi][yi] && !matrix.tiles[xi][yi].length) {
                    floodFillEmpty(ignorePoints, matrix, xi, yi, w);
                }
            }
        }
    }

    function floodFillOccupied(ignorePoints: ILevelPlayMatrix<boolean>, matrix: ILevelPlayMatrix<ILevelPlayEntityDescription[]>, x: number, y: number) {
        ignorePoints.tiles[x][y] = true;
        for (let p of POINT_DIRECTIONS_CARDINAL) {
            let xi = x + p.x;
            let yi = y + p.y;
            if (xi >= 0 && xi < matrix.width && yi >= 0 && yi < matrix.height && !ignorePoints.tiles[xi][yi] && matrix.tiles[xi][yi].length) {
                floodFillOccupied(ignorePoints, matrix, xi, yi);
            }
        }
    }

    return function (stateKey: ILevelPlayStateKey, matrix: ILevelPlayMatrix<ILevelPlayEntityDescription[]>, validEntityTypes: IEntityType[], difficulty: number, rng: IRandomNumberGenerator) {
        proxied(stateKey, matrix, validEntityTypes, difficulty, rng);
        let points: IPoint[] = [];
        levelPlayMatrixIterateAll(matrix, function (value: ILevelPlayEntityDescription[], x: number, y: number) {
            if (value.length) {
                var index = rng(points.length);
                // make sure it's random
                points.splice(index, 0, { x: x, y: y });
            }
            return value;
        });
        for (let point of points) {
            fill(matrix, point);
        }
    }

}