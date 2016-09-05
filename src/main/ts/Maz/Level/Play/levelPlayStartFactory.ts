function levelPlayStartFactory(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    entityUpdate: (mind: IRecord<LevelPlayEntityMind>, state: ILevelPlayState, entity: ILevelPlayEntity) => ILevelPlayEntityMindUpdateResult,
    inputs: { [_: number]: IInputAtomic },
    maxCollisionSteps: number
): IStateStartFunction {

    function render(state: ILevelPlayState, dirtyTiles: ILevelPlayMatrix<boolean>) {
        for (let tx = dirtyTiles.width; tx > 0;) {
            tx--;
            let dirtyTilesX = dirtyTiles.tiles[tx];
            let entitiesX = state.matrix.tiles[tx];
            let x = tx * state.tileSize;
            for (let ty = dirtyTiles.height; ty > 0;) {
                ty--;
                let dirtyTileXY = dirtyTilesX[ty];
                if (dirtyTileXY) {
                    let entitiesXY = entitiesX[ty];
                    let y = ty * state.tileSize;

                    context.fillStyle = COLOR_BLACK;
                    context.fillRect(x, y, state.tileSize, state.tileSize);

                    for (let entity of entitiesXY) {
                        if (!entity.renderNotDirty) {
                            let renderContext = entity.renderContext;
                            renderContext.clearRect(0, 0, entity.baseWidth, entity.baseHeight);

                            renderContext.drawImage(entity.renderMask, 0, 0);
                            renderContext.save();
                            renderContext.globalCompositeOperation = 'source-in';
                            let background = entity.description.type.backgroundColor;
                            if (background) {
                                renderContext.fillStyle = background;
                            } else {
                                renderContext.fillStyle = entity.description.type.foregroundColor;
                            }
                            renderContext.fillRect(0, 0, entity.baseWidth, entity.baseHeight);
                            if (background) {
                                renderContext.globalCompositeOperation = 'source-atop';
                                renderContext.fillStyle = entity.description.type.foregroundColor;
                                renderContext.fillText(entity.description.type.character, entity.offsetX, entity.offsetY);
                            }
                            renderContext.restore();

                            // apply animations
                            let previousCanvas = entity.render;

                            for (let animationId in entity.animations) {
                                let animation = entity.animations[animationId];
                                for (let tween of animation.tweens) {
                                    let t: number;
                                    if (tween.repeat) {
                                        t = (animation.age % tween.durationMillis) / tween.durationMillis;
                                    } else {
                                        t = Math.min(1, animation.age / tween.durationMillis);
                                    }
                                    let p = recordEasingFunction(tween.easing, t);

                                    let canvas = <HTMLCanvasElement>document.createElement('canvas');
                                    canvas.width = previousCanvas.width;
                                    canvas.height = previousCanvas.height;
                                    let context = canvas.getContext('2d');
                                    context.save();
                                    recordContextEffectFunction(tween.effect, p, previousCanvas, canvas, context);
                                    context.restore();
                                    previousCanvas = canvas;

                                }
                            }
                            entity.render = previousCanvas;
                            entity.renderContext = previousCanvas.getContext('2d');

                            entity.renderNotDirty = true;
                        }
                        let sx = Math.max(0, x - entity.x);
                        let sy = Math.max(0, y - entity.y);
                        let dx = Math.max(entity.x, x);
                        let dy = Math.max(entity.y, y);
                        let sw = Math.min(state.tileSize - (dx - x), entity.width - sx);
                        let sh = Math.min(state.tileSize - (dy - y), entity.height - sy);
                        if (sw > 0 && sh > 0) {
                            context.drawImage(
                                entity.render,
                                sx,
                                sy,
                                sw,
                                sh,
                                dx,
                                dy,
                                sw,
                                sh
                            );
                        }
                    }

                    dirtyTilesX[ty] = false;
                }
            }
        }
    }

    function getCollisionHandler(fromEntity: ILevelPlayEntity, withEntity: ILevelPlayEntity) {
        // TODO parents
        for (let collisionHandler of fromEntity.description.type.collisionHandlers) {
            if (collisionHandler.filter(withEntity.description.type)) {
                return collisionHandler;
            }
        }
    }

    function dirtyTileSetter() {
        return true;
    }


    return function (state: ILevelPlayState, nextStateCallback: IStateCompleteCallback): IRecord<ILevelPlayStateRunner> {

        let intersectionCanvas = <HTMLCanvasElement>document.createElement('canvas');
        intersectionCanvas.width = state.tileSize;
        intersectionCanvas.height = state.tileSize;
        let intersectionContext = intersectionCanvas.getContext('2d');

        let dirtyTiles = levelPlayMatrixCreate(state.width, state.height, function () {
            return true;
        });

        function setEntityDirty(entity: ILevelPlayEntity) {
            entity.renderNotDirty = false;
            levelPlayMatrixIterate(dirtyTiles, state.tileSize, entity, dirtyTileSetter);
        }


        function update(state: ILevelPlayState, duration: number) {
            let checkEntities: ILevelPlayEntity[] = [];
            for (let i = state.entities.length; i > 0;) {
                i--;
                let entity = state.entities[i];
                let updateResult = entityUpdate(entity.description.mind, state, entity);
                // deal with new entities
                if (updateResult) {
                    if (updateResult.newEntities) {
                        for (let newEntity of updateResult.newEntities) {
                            state.entities.push(newEntity);
                            // NOTE do we need to check the new entity?
                        }
                    }
                    if (updateResult.deletedAnimationIds) {
                        for (let deletedAnimationId of updateResult.deletedAnimationIds) {
                            delete entity.animations[deletedAnimationId];
                        }
                    }
                    if (updateResult.newAnimations) {
                        for (let newAnimationId in updateResult.newAnimations) {
                            let newAnimation = updateResult.newAnimations[newAnimationId];
                            newAnimation.age = 0;
                            entity.animations[newAnimationId] = newAnimation;
                        }
                    }
                }

                // deal with dead entities
                if (entity.dead) {
                    state.entities.splice(i, 1);
                    setEntityDirty(entity);
                    levelPlayEntityMatrixRemove(state.matrix, state.tileSize, entity);
                } else {
                    entity.updateStartX = entity.x;
                    entity.updateStartY = entity.y;
                    entity.updateDurationOffset = 0;
                    if (entity.velocityX || entity.velocityY) {
                        levelPlayEntityMatrixRemove(state.matrix, state.tileSize, entity);
                        setEntityDirty(entity);

                        entity.x += entity.velocityX * duration * state.tileSize;
                        entity.y += entity.velocityY * duration * state.tileSize;
                        checkEntities.push(entity);

                        levelPlayEntityMatrixAdd(state.matrix, state.tileSize, entity);
                        setEntityDirty(entity);

                    }
                    let first = true;
                    for (let animationId in entity.animations) {
                        let animation = entity.animations[animationId];
                        if (first) {
                            setEntityDirty(entity);
                            first = false;
                        }
                        animation.age += duration;
                    }
                }

            }

            // deal with collisions
            do {
                let newCheckEntities: ILevelPlayEntity[] = [];

                for (let i = checkEntities.length; i > 0;) {
                    i--;
                    let checkEntity = checkEntities[i];
                    let minCollisionTime: number;
                    let minCollisionEntity: ILevelPlayEntity;
                    let minCollisionEntityCollisionHandler: ICollisionHandler;
                    let minCheckEntityCollisionHandler: ICollisionHandler;
                    let collidableEntities = levelPlayMatrixList(state.matrix, state.tileSize, checkEntity);
                    for (let collidableEntity of collidableEntities) {

                        // do they overlap?
                        if (checkEntity != collidableEntity && !checkEntity.dead && !collidableEntity.dead && overlaps(checkEntity, checkEntity, collidableEntity, collidableEntity)) {

                            // do they interact in any way?
                            let checkEntityCollisionHandler = getCollisionHandler(checkEntity, collidableEntity);
                            let collisionHandler = getCollisionHandler(collidableEntity, checkEntity);

                            if (checkEntityCollisionHandler != null || collisionHandler != null) {
                                // work out when they collided by stepping back 
                                let startTime = Math.max(checkEntity.updateDurationOffset, collidableEntity.updateDurationOffset);
                                let endTime = duration;
                                let entityBounds: any = {
                                    width: collidableEntity.width,
                                    height: collidableEntity.height
                                };
                                let checkEntityBounds: any = {
                                    width: checkEntity.width,
                                    height: checkEntity.height
                                };
                                for (let step = 0; step < maxCollisionSteps; step++) {
                                    let collisionTime = (endTime + startTime) / 2;

                                    entityBounds.x = collidableEntity.updateStartX + (collidableEntity.velocityX * collisionTime) / state.tileSize;
                                    entityBounds.y = collidableEntity.updateStartY + (collidableEntity.velocityY * collisionTime) / state.tileSize;

                                    checkEntityBounds.x = checkEntity.updateStartX + (checkEntity.velocityX * collisionTime) / state.tileSize;
                                    checkEntityBounds.y = checkEntity.updateStartY + (checkEntity.velocityY * collisionTime) / state.tileSize;

                                    if (overlaps(checkEntity, checkEntityBounds, collidableEntity, entityBounds)) {
                                        endTime = collisionTime;
                                    } else {
                                        startTime = collisionTime;
                                    }
                                }
                                if (!minCollisionEntity || startTime < minCollisionTime) {
                                    minCollisionEntity = collidableEntity;
                                    minCollisionTime = startTime;
                                    minCollisionEntityCollisionHandler = collisionHandler;
                                    minCheckEntityCollisionHandler = checkEntityCollisionHandler;
                                }

                            }
                        }
                    }
                    if (minCollisionEntity) {
                        // back out to the min collision time and adjust position (and velocity, and whatever else our 'physics' engine handles
                        if (minCheckEntityCollisionHandler) {
                            if (minCheckEntityCollisionHandler.collisionResolution.type == COLLISION_RESOLUTION_TYPE_SOLID) {
                                levelPlayEntityMatrixRemove(state.matrix, state.tileSize, checkEntity);

                                checkEntity.x = checkEntity.updateStartX + (checkEntity.velocityX * minCollisionTime) / state.tileSize;
                                checkEntity.y = checkEntity.updateStartY + (checkEntity.velocityY * minCollisionTime) / state.tileSize;
                                checkEntity.velocityX = 0;
                                checkEntity.velocityY = 0;

                                levelPlayEntityMatrixAdd(state.matrix, state.tileSize, checkEntity);
                                setEntityDirty(checkEntity);

                            } else if (minCheckEntityCollisionHandler.collisionResolution.type == COLLISION_RESOLUTION_TYPE_EAT) {
                                minCollisionEntity.dead = true;
                            }
                            if (checkEntity.updateDurationOffset < minCollisionTime) {
                                checkEntity.updateDurationOffset = minCollisionTime;
                                newCheckEntities.push(checkEntity);
                            }
                        }

                        if (minCollisionEntityCollisionHandler) {

                            if (minCollisionEntityCollisionHandler.collisionResolution.type == COLLISION_RESOLUTION_TYPE_SOLID) {
                                levelPlayEntityMatrixRemove(state.matrix, state.tileSize, minCollisionEntity);

                                minCollisionEntity.x = minCollisionEntity.updateStartX + (minCollisionEntity.velocityX * minCollisionTime) / state.tileSize;
                                minCollisionEntity.y = minCollisionEntity.updateStartY + (minCollisionEntity.velocityY * minCollisionTime) / state.tileSize;
                                minCollisionEntity.velocityX = 0;
                                minCollisionEntity.velocityY = 0;

                                levelPlayEntityMatrixAdd(state.matrix, state.tileSize, minCollisionEntity);
                                setEntityDirty(minCollisionEntity);

                            } else if (minCollisionEntityCollisionHandler.collisionResolution.type == COLLISION_RESOLUTION_TYPE_EAT) {
                                checkEntity.dead = true;
                            }

                            if (minCollisionEntity.updateDurationOffset < minCollisionTime) {
                                minCollisionEntity.updateDurationOffset = minCollisionTime;
                                // this might be getting added multiple times
                                if (!arrayContains(newCheckEntities, minCollisionEntity)) {
                                    newCheckEntities.push(minCollisionEntity);
                                }
                            }
                        }

                        // TODO exclude from future collisions if the collisions are at zero duration
                    }
                }
                checkEntities = newCheckEntities;
            } while (checkEntities.length);
        }

        function overlaps(entity1: ILevelPlayEntity, bounds1: IRectangle, entity2: ILevelPlayEntity, bounds2: IRectangle): boolean {
            let intersection = rectangleIntersection(bounds1, bounds2);
            let result: boolean;
            if (intersection) {
                // check the masks overlap
                intersectionContext.clearRect(0, 0, intersection.width, intersection.height);
                intersectionContext.drawImage(entity1.renderMask, bounds1.x - intersection.x, bounds1.y - intersection.y);
                intersectionContext.save();
                intersectionContext.globalCompositeOperation = 'destination-in';
                intersectionContext.drawImage(entity2.renderMask, bounds2.x - intersection.x, bounds2.y - intersection.y);
                intersectionContext.restore();

                // look for any non-transparent pixels
                let intersectionData = intersectionContext.getImageData(0, 0, intersection.width, intersection.height);
                let max = intersectionData.width * intersectionData.height * 4;
                result = false;
                for (let i = 3; i < max; i += 4) {
                    let alpha = intersectionData.data[i];
                    if (alpha > 0) {
                        result = true;
                        break;
                    }
                }
            } else {
                result = false;
            }
            return result;
        }


        canvas.removeAttribute('class');

        var lastUpdate = performance.now();
        var animationCallback: FrameRequestCallback = function (now: number) {

            var diff = Math.max(1, Math.min(100, now - lastUpdate));
            lastUpdate = now;
            update(state, diff);

            render(state, dirtyTiles);

            runner.animationFrameRequestId = requestAnimationFrame(animationCallback);
        };

        var animationFrameRequestId = requestAnimationFrame(animationCallback);

        var runner: ILevelPlayStateRunner = {
            animationFrameRequestId: animationFrameRequestId
        };

        document.onkeydown = function (e: KeyboardEvent) {
            let input = inputs[e.keyCode];
            if (input) {
                input.unread = true;
                input.active = true;
            }
        };

        document.onkeyup = function (e: KeyboardEvent) {
            let input = inputs[e.keyCode];
            if (input) {
                input.active = false;
            }
        };

        return {
            type: STATE_LEVEL_PLAY,
            value: runner
        };
    }
}