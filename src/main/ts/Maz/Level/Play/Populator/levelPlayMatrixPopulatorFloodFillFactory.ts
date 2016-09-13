function levelPlayMatrixPopulatorFloodFillFactory(
    minFills: number,
    maxFills: number,
    fillDifficultyMultiplier: number,
    fillQuantity: number,
    fillQuantityDifficultyMultiplier: number,
    maxAttempts: number,
    filter: (entities: ILevelPlayEntityDescription[], matrix?: ILevelPlayMatrix<ILevelPlayEntityDescription[]>, x?: number, y?: number) => boolean, 
    side: Side,
    classification: Classification
): ILevelPlayMatrixPopulator {
    return function (stateKey: ILevelPlayStateKey, matrix: ILevelPlayMatrix<ILevelPlayEntityDescription[]>, validEntityTypes: IEntityType[], difficulty: number, rng: IRandomNumberGenerator): void {
        let fills = minFills + rng(maxFills - minFills + 1);
        let fillsRemaining = ceil(fills + fillDifficultyMultiplier * difficulty);
        let attemptsRemaining = maxAttempts + fillsRemaining;
          
        let count = 0;

        while (fillsRemaining > 0 && attemptsRemaining > 0) {
            attemptsRemaining--;

            // pick a spot
            let x = rng(matrix.width);
            let y = rng(matrix.height);

            let entityTypeFunction = levelPlayMatrixPopulatorGetBestEntityType(validEntityTypes, count, difficulty, rng);

            function accept(x: number, y: number, points: IPoint[]) {
                let entityDescriptions = matrix.tiles[x][y];
                if (filter(entityDescriptions, matrix, x, y)) {
                    for (let entityDescription of entityDescriptions) {
                        if (entityDescription.t.classification == classification) {
                            return; // same as false
                        }
                    }
                    for (let point of points) {
                        if (point.x == x && point.y == y) {
                            return; // false
                        }
                    }
                    return true;
                }
            }

            // does the spot match the filter?
            if (accept(x, y, [])) {
                count++;
                fillsRemaining--;

                // flood fill (one) entity type
                let positions: IPoint[] = [{ x: x, y: y }];
                let quantity = ceil(fillQuantity + fillQuantityDifficultyMultiplier * difficulty);
                let positionIndex = 0;
                while (positionIndex < quantity && positionIndex < positions.length) {
                    let position = positions[positionIndex];
                    let monsterMind: ILevelPlayEntityMindMonster = {
                    };
                    matrix.tiles[position.x][position.y].push({
                        mind: {
                            t: MIND_MONSTER,
                            v: monsterMind
                        },
                        t: entityTypeFunction(),
                        side: side
                    });

                    for (let offset of POINT_DIRECTIONS_CARDINAL) {
                        let offsetPositionX = position.x + offset.x;
                        let offsetPositionY = position.y + offset.y;
                        if (
                            offsetPositionX >= 0 &&
                            offsetPositionX < matrix.width &&
                            offsetPositionY >= 0 &&
                            offsetPositionY < matrix.height &&
                            accept(offsetPositionX, offsetPositionY, positions)
                        ) {
                            positions.push({
                                x: offsetPositionX,
                                y: offsetPositionY
                            });
                        }
                    }
                    positionIndex++;
                }

            }
        }
    }
}