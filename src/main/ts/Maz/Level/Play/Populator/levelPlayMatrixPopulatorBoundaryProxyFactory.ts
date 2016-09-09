function levelPlayMatrixPopulatorBoundaryProxyFactory(
    proxied: ILevelPlayMatrixPopulator,
    wallEntityType: IEntityType
): ILevelPlayMatrixPopulator {

    return function (stateKey: ILevelPlayStateKey, matrix: ILevelPlayMatrix<ILevelPlayEntityDescription[]>, validEntityTypes: IEntityType[], difficulty: number, rng: IRandomNumberGenerator) {
        // TODO select the character that will mutate on clearing the level as the wall character

        let innerMatrix: ILevelPlayMatrix<ILevelPlayEntityDescription[]> = levelPlayMatrixCreate(matrix.width - 2, matrix.height - 2, function () {
            return [];
        });
        proxied(stateKey, innerMatrix, validEntityTypes, difficulty, rng);
        levelPlayMatrixIterateAll(innerMatrix, function (value: ILevelPlayEntityDescription[], x: number, y: number) {
            matrix.tiles[x + 1][y + 1] = value;
            // TODO can remove this return if we can trick the TS compiler
            return value;
        });
        // add in the walls
        let stickyPoints: IPoint[] = [];
        let removablePoints: IPoint[][] = [];

        let removablePointsTop: IPoint[] = [];
        let removablePointsBottom: IPoint[] = [];
        let removablePointsLeft: IPoint[] = [];
        let removablePointsRight: IPoint[] = [];

        removablePoints.push(removablePointsTop, removablePointsBottom, removablePointsLeft, removablePointsRight);
        for (let x = 0; x < matrix.width; x++) {
            let top: IPoint = {
                x: x, 
                y: 0
            };
            let bottom: IPoint = {
                x: x,
                y: matrix.height-1
            };
            if (x <= 1 || x >= matrix.width - 2) {
                stickyPoints.push(top, bottom);
            } else {
                if (matrix.tiles[x][1].length) {
                    stickyPoints.push(top);
                } else {
                    removablePointsTop.push(top);
                }
                if (matrix.tiles[x][matrix.height - 1].length) {
                    stickyPoints.push(bottom);
                } else {
                    removablePointsBottom.push(bottom);
                }
            }
        }
        for (let y = 1; y < matrix.height-1; y++) {
            let left: IPoint = {
                x: 0,
                y: y
            };
            let right: IPoint = {
                x: matrix.width - 1, 
                y: y
            };
            if (y <= 1 || y >= matrix.height - 2) {
                stickyPoints.push(left, right);
            } else {
                if (matrix.tiles[1][y].length) {
                    stickyPoints.push(left);
                } else {
                    removablePointsLeft.push(left);
                }
                if (matrix.tiles[matrix.width - 1][y].length) {
                    stickyPoints.push(right);
                } else {
                    removablePointsRight.push(right);
                }
            }
        }

        for (let i in removablePoints) {
            let removablePointList = removablePoints[i];
            if (removablePointList.length) {
                let ii = parseInt(i);
                let xm: number;
                let ym: number;
                let add = ii % 2;
                if (ii >= 2) {
                    ym = 0;
                    xm = 9999;
                } else {
                    xm = 0;
                    ym = 99;
                }
                let wallRng = randomNumberGeneratorFactory(stateKey.universe.seed + (stateKey.x + add) * xm + (stateKey.y + add) * ym + stateKey.z);
                let index = wallRng(removablePointList.length);
                removablePointList.splice(index, 1);
                // should add all
                stickyPoints.push.apply(stickyPoints, removablePointList);
            }
        }
        for (let stickyPoint of stickyPoints) {
            let entityDescription: ILevelPlayEntityDescription = {
                type: wallEntityType,
                mind: {
                    type: MIND_INERT
                }
            };
            matrix.tiles[stickyPoint.x][stickyPoint.y].push(entityDescription);
        }
    }
}