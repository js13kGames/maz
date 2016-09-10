function levelPlayEntityMindMonsterUpdateFactory(
    tileCenterFraction: number,
    collisionHandlerSearch: ICollisionHandlerSearch,
    costCollisionResolutionValueFunction: IRecordCollisionResolutionValueFunction,
    desirabilityCollisionResolutionValueFunction: IRecordCollisionResolutionValueFunction,
    inverseDesirabilityCollisionResolutionValueFunction: IRecordCollisionResolutionValueFunction
    
): ILevelPlayEntityMindUpdateFunction {
    function populateDecisionMatrix(
        entityType: IEntityType,
        bounds: IRectangle,
        rng: IRandomNumberGenerator,
        entityTypeDecisionMatrix: ILevelPlayMatrix<ILevelPlayEntityMindDecisionTile>,
        monsterDecisionMatrix: ILevelPlayMatrix<ILevelPlayEntityMindMonsterDecisionTile>,
        tx: number,
        ty: number,
        direction: Direction,
        cost: number, 
        cumulativeDanger: number,
        first?: boolean
    ): number {
        let entityTypeTile = entityTypeDecisionMatrix.tiles[tx][ty];
        let monsterTile = monsterDecisionMatrix.tiles[tx][ty];
        if (monsterTile.cumulativeCost == null || monsterTile.cumulativeCost > cost) {
            let entityTypeTile = entityTypeDecisionMatrix.tiles[tx][ty];
            monsterTile.cumulativeCost = cost;
            let rawDesirability = entityTypeTile.desirability + rng() * entityType.distractibility;
            let desirability = rawDesirability * Math.pow(entityType.dedication, cost);
            monsterTile.desirability = desirability;
            let rawDanger = entityTypeTile.danger;
            let danger = cumulativeDanger + rawDanger * Math.pow(entityType.cowardliness, cost);
            monsterTile.danger = danger;
            monsterTile.entryDirection = direction;
            let bestPointValue = first?-999:desirability - danger;
            for (let nextDirectionIndex in POINT_DIRECTIONS_CARDINAL) {
                let nextDirection = parseInt(nextDirectionIndex) + 1;
                let offset = POINT_DIRECTIONS_CARDINAL[nextDirectionIndex];
                let nextTx = tx + offset.x;
                let nextTy = ty + offset.y;
                if (nextTx >= bounds.x && nextTx < bounds.x + bounds.width && nextTy >= bounds.y && nextTy < bounds.y + bounds.height) {
                    let nextCost = cost + entityType.tileCost + entityTypeTile.costToTraverse;
                    if ((nextDirection + direction - 2) % 2) {
                        // turning left or right
                        nextCost += entityType.turnCost;
                    } else if (nextDirection != direction) {
                        // going back the way we came
                        nextCost += entityType.flipCost;
                    } 
                    let checkPointValue = populateDecisionMatrix(
                        entityType,
                        bounds,
                        rng,
                        entityTypeDecisionMatrix,
                        monsterDecisionMatrix,
                        nextTx,
                        nextTy,
                        nextDirection,
                        nextCost,
                        danger
                    );
                    if (checkPointValue != null && checkPointValue > bestPointValue) {
                        bestPointValue = checkPointValue;
                    }
                }
            }
            return bestPointValue;
        } 

    }

    function findBestPath(
        fromX, 
        fromY, 
        toX, 
        toY,
        decisionMatrix: ILevelPlayMatrix<ILevelPlayEntityMindMonsterDecisionTile>,
        result: IPoint[]
    ) {
        if (fromX != toX || fromY != toY) {
            let tile = decisionMatrix.tiles[fromX][fromY];
            result.push({
                x: fromX,
                y: fromY
            });
            let offset = POINT_DIRECTIONS_CARDINAL[tile.entryDirection - 1];
            findBestPath(fromX - offset.x, fromY - offset.y, toX, toY, decisionMatrix, result);
        }
    }

    return function (mind: ILevelPlayEntityMindMonster, state: ILevelPlayState, entity: ILevelPlayEntity): ILevelPlayEntityMindUpdateResult {
        let result: ILevelPlayEntityMindUpdateResult = {};
        let entityType = entity.description.type;

        let entityCX = entity.x + entity.width / 2;
        let entityCY = entity.y + entity.height / 2;
        let currentTileX = Math.floor(entityCX / state.tileSize);
        let currentTileY = Math.floor(entityCY / state.tileSize);


        if (entity.velocityX || entity.velocityY) {
            result.newEntityState = ENTITY_STATE_MOVING;
        } else {
            result.newEntityState = ENTITY_STATE_IDLE;
        }

        let decide = entity.description.type.speed && (!mind.lastDecisionPath || !mind.lastDecisionPath.length || mind.nextDecisionAgeMillis < state.ageMillis);
        if (decide) {
            // work out the desirability of each tile for the entity type
            let update: boolean;
            let decisionCache = state.entityTypeDecisionCaches[entity.description.type.character];
            if (!decisionCache) {
                let decisionMatrix = levelPlayMatrixCreate(state.width, state.height, function () {
                    return {}
                });
                decisionCache = {
                    decisionMatrix: decisionMatrix
                }
                state.entityTypeDecisionCaches[entity.description.type.character] = decisionCache;
                update = true;
            } else {
                update = state.ageMillis - decisionCache.updatedAtAgeMillis > entity.description.type.observationTimeoutMillis;
            }
            if (update) {

                levelPlayMatrixIterateAll(decisionCache.decisionMatrix, function (tile: ILevelPlayEntityMindDecisionTile, x: number, y: number) {
                    let tileEntities = state.matrix.tiles[x][y];
                    let desirability = 0;
                    let danger = 0;
                    let costToTraverse = 0;
                    for (let tileEntity of tileEntities) {
                        let tileEntityType = tileEntity.description.type;
                        let cx = tileEntity.x + tileEntity.width / 2;
                        let cy = tileEntity.y + tileEntity.height / 2;
                        let tx = Math.floor(cx / state.tileSize);
                        let ty = Math.floor(cy / state.tileSize);
                        let entityCollisionResult = collisionHandlerSearch(entityType, tileEntityType);
                        if (entityCollisionResult) {
                            if (tx == x && ty == y) {
                                // calculate desirability of us doing this thing
                                let collisionResultDesirability = desirabilityCollisionResolutionValueFunction(entityCollisionResult, entityType, tileEntityType);
                                if (collisionResultDesirability > 0) {
                                    desirability += collisionResultDesirability;
                                } else {
                                    danger -= collisionResultDesirability;
                                }
                            }
                            costToTraverse += costCollisionResolutionValueFunction(entityCollisionResult, entityType, tileEntityType);
                        }
                        if (tx == x && ty == y) {
                            // assume that the cost is not relevant for things that happen to us, only desirability
                            let entityTileCollisionResult = collisionHandlerSearch(tileEntityType, entityType);
                            if (entityTileCollisionResult) {
                                // calculate the desirability of this thing happening to us 
                                // reverse handler for desirability...
                                let collisionResultDesirability = inverseDesirabilityCollisionResolutionValueFunction(entityTileCollisionResult, entityType, tileEntityType);
                                if (collisionResultDesirability > 0) {
                                    desirability += collisionResultDesirability;
                                } else {
                                    danger -= collisionResultDesirability;
                                }
                            }
                        }
                    }
                    tile.costToTraverse = costToTraverse;
                    tile.desirability = desirability;
                    tile.danger = danger;
                    return tile;
                });

                decisionCache.updatedAtAgeMillis = state.ageMillis;
            }

            // calculate a path to the most desirable tile (or away from least desirable tile)
            let resetFunction = function () {
                return {};
            };
            if (!mind.decisionMatrix) {
                mind.decisionMatrix = levelPlayMatrixCreate(state.width, state.height, resetFunction);
            } else {
                levelPlayMatrixIterateAll(mind.decisionMatrix, resetFunction);
            }
            let boundsX = Math.max(0, currentTileX - entityType.visionRange);
            let boundsY = Math.max(0, currentTileY - entityType.visionRange);
            let bounds: IRectangle = {
                x: boundsX,
                y: boundsY,
                width: Math.min(state.width - boundsX, entityType.visionRange * 2),
                height: Math.min(state.height - boundsY, entityType.visionRange * 2)
            };
            let bestValue = populateDecisionMatrix(
                entityType,
                bounds,
                state.rng,
                decisionCache.decisionMatrix,
                mind.decisionMatrix,
                currentTileX,
                currentTileY,
                // turn the orientation into a direction using bitwise operation
                entity.orientation & 0x7,
                1,
                0,
                true
            );
            let bestTiles: IPoint[] = [];
            levelPlayMatrixIterate(mind.decisionMatrix, 1, bounds, function (t: ILevelPlayEntityMindMonsterDecisionTile, x: number, y: number) {
                let v = t.desirability - t.danger;
                if (v >= bestValue) {
                    bestTiles.push({ x: x, y: y });
                }
                return t;
            });
            if (bestTiles.length) {
                let bestTileIndex = state.rng(bestTiles.length);
                let bestTile = bestTiles[bestTileIndex];
                let path: IPoint[] = [];
                findBestPath(
                    bestTile.x,
                    bestTile.y,
                    currentTileX,
                    currentTileY,
                    mind.decisionMatrix,
                    path
                );

                mind.lastDecisionPath = path;
                mind.nextDecisionAgeMillis = state.ageMillis + entity.description.type.minDecisionTimeoutMillis + state.rng(entity.description.type.varianceDecisionTimeoutMillis);
            }
        }

        // go in that direction
        if (mind.lastDecisionPath) {
            let done = false;
            while (!done && mind.lastDecisionPath.length) {
                let nextTile = mind.lastDecisionPath[mind.lastDecisionPath.length - 1];
                let dtx = nextTile.x - currentTileX;
                let dty = nextTile.y - currentTileY;
                let direction: Direction;
                let centerMargin = tileCenterFraction * state.tileSize;
                let dx = (entityCX % state.tileSize) - state.tileSize / 2;
                let dy = (entityCY % state.tileSize) - state.tileSize / 2;
                let absdx = Math.abs(dx);
                let absdy = Math.abs(dy);
                if (nextTile.x != currentTileX || nextTile.y != currentTileY || absdx > centerMargin || absdy > centerMargin) {
                    if (dtx == 0) {
                        if (absdx > centerMargin) {
                            if (dx > 0) {
                                direction = DIRECTION_WEST;
                            } else {
                                direction = DIRECTION_EAST;
                            }
                        } else {
                            if (dty > 0 || dty == 0 && dy < 0) {
                                direction = DIRECTION_SOUTH;
                            } else {
                                direction = DIRECTION_NORTH;
                            }
                        }
                    } else {
                        if (absdy > centerMargin) {
                            if (dy > 0) {
                                direction = DIRECTION_NORTH;
                            } else {
                                direction = DIRECTION_SOUTH;
                            }
                        } else {
                            if (dtx > 0 || dtx == 0 && dx < 0) {
                                direction = DIRECTION_EAST;
                            } else {
                                direction = DIRECTION_WEST;
                            }
                        }
                    }
                    result.newDirection = direction;
                    done = true;
                } else {
                    mind.lastDecisionPath.splice(mind.lastDecisionPath.length - 1, 1);
                }
            }
        }

        return result;
    }
}