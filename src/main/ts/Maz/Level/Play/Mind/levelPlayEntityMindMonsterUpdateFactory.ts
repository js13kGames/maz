function levelPlayEntityMindMonsterUpdateFactory(
    tileCenterFraction: number,
    collisionHandlerSearch: ICollisionHandlerSearch
    
): ILevelPlayEntityMindUpdateFunction {
    return function (mind: ILevelPlayEntityMindMonster, state: ILevelPlayState, entity: ILevelPlayEntity): ILevelPlayEntityMindUpdateResult {
        let result: ILevelPlayEntityMindUpdateResult = {};
        let entityType = entity.description.type;

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
                    decisionMatrix: decisionMatrix,
                    updatedAtAgeMillis: state.ageMillis
                }
                update = true;
            } else {
                update = state.ageMillis - decisionCache.updatedAtAgeMillis > entity.description.type.observationTimeoutMillis;
            }
            if (update) {

                levelPlayMatrixIterateAll(decisionCache.decisionMatrix, function (tile: ILevelPlayEntityMindDecisionTile, x: number, y: number) {
                    let tileEntities = state.matrix.tiles[x][y];
                    let desirability = 0;
                    let costToTraverse = 0;
                    for (let tileEntity of tileEntities) {
                        let tileEntityType = tileEntity.description.type;
                        let cx = tileEntity.x + tileEntity.width / 2;
                        let cy = tileEntity.y + tileEntity.height / 2;
                        let tx = Math.round(cx / state.tileSize);
                        let ty = Math.round(cy / state.tileSize);
                        let entityCollisionResult = collisionHandlerSearch(entityType, tileEntityType);
                        if (entityCollisionResult) {
                            if (tx == x && ty == y) {
                                // calculate desirability of us doing this thing
                                // TODO handler for desirability
                                let collisionResultDesirability = 0;
                                if (Math.abs(collisionResultDesirability) > Math.abs(desirability)) {
                                    desirability = collisionResultDesirability;
                                }
                            }
                            costToTraverse += 1; // TODO handler for costs 
                        }
                        if (tx == x && ty == y) {
                            // assume that the cost is not relevant for things that happen to us, only desirability
                            let entityTileCollisionResult = collisionHandlerSearch(tileEntityType, entityType);
                            if (entityTileCollisionResult) {
                                // calculate the desirability of this thing happening to us 
                                // TODO handler for desirability
                                let collisionResultDesirability = 0;
                                if (Math.abs(collisionResultDesirability) > Math.abs(desirability)) {
                                    desirability = collisionResultDesirability;
                                }
                            }
                        }
                        
                    }
                    tile.costToTraverse = costToTraverse;
                    tile.desirability = desirability;
                    return tile;
                });

                decisionCache.updatedAtAgeMillis = state.ageMillis;
            }

            // calculate a path to the most desirable tile (or away from least desirable tile)

            let entityCX = entity.x + entity.width / 2;
            let entityCY = entity.y + entity.height / 2;
            let currentTileX = Math.round(entityCX / state.tileSize);
            let currentTileY = Math.round(entityCY / state.tileSize);

            let dx: number;
            let dy: number;
            if (state.rng(2)) {
                dy = 0;
                if (state.rng(2)) {
                    dx = 1;
                } else {
                    dx = -1;
                }
            } else {
                dx = 0;
                if (state.rng(2)) {
                    dy = 1;
                } else {
                    dy = -1;
                }
            }


            mind.lastDecisionPath = [{
                x: currentTileX + dx, 
                y: currentTileY + dy
            }];
            mind.nextDecisionAgeMillis = state.ageMillis + entity.description.type.minDecisionTimeoutMillis + state.rng(entity.description.type.varianceDecisionTimeoutMillis);
        }

        // go in that direction
        if (mind.lastDecisionPath) {
            let entityCX = entity.x + entity.width / 2;
            let entityCY = entity.y + entity.height / 2;
            let currentTileX = Math.round(entityCX / state.tileSize);
            let currentTileY = Math.round(entityCY / state.tileSize);
            let done = false;
            while (!done && mind.lastDecisionPath.length) {
                let nextTile = mind.lastDecisionPath[0];
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
                            if (dty > 0) {
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
                            if (dtx > 0) {
                                direction = DIRECTION_EAST;
                            } else {
                                direction = DIRECTION_WEST;
                            }
                        }
                    }
                    result.newDirection = direction;
                    done = true;
                } else {
                    mind.lastDecisionPath.splice(0, 1);
                }
            }
        }

        return result;
    }
}