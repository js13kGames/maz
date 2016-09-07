function levelPlayStartFactory(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    entityUpdate: (mind: IRecord<LevelPlayEntityMind>, state: ILevelPlayState, entity: ILevelPlayEntity) => ILevelPlayEntityMindUpdateResult,
    inputs: { [_: number]: IInputAtomic },
    maxCollisionSteps: number,
    recordEasingFunction: IRecordEasingFunction,
    recordContextEffectFunction: IRecordContextEffectFunction
): IStateStartFunction {

    function render(state: ILevelPlayState, dirtyTiles: ILevelPlayMatrix<boolean>): void {
        context.save();
        context.translate(state.renderOffsetX, state.renderOffsetY);
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
                            renderContext.clearRect(0, 0, entity.width, entity.height);

                            // render unrotated/flipped
                            
                            let orientationTransformation = ORIENTATION_TRANSFORMATIONS[entity.orientation];
                            renderContext.save();
                            renderContext.translate(entity.width / 2, entity.height / 2);
                            renderContext.rotate(orientationTransformation.rotate * -Math.PI / 2);
                            if (orientationTransformation.flipY) {
                                renderContext.scale(1, -1);
                            }
                            renderContext.drawImage(entity.renderMask, -entity.width / 2, -entity.height / 2);
                            renderContext.restore();
                            renderContext.save();
                            renderContext.globalCompositeOperation = 'source-in';
                            let background = entity.description.type.backgroundColor;
                            if (background) {
                                renderContext.fillStyle = background;
                            } else {
                                renderContext.fillStyle = entity.description.type.foregroundColor;
                            }
                            renderContext.fillRect(0, 0, entity.width, entity.height);
                            renderContext.globalCompositeOperation = 'source-atop';
                            if (background) {
                                renderContext.fillStyle = entity.description.type.foregroundColor;
                                renderContext.fillText(entity.description.type.character, entity.offsetX, entity.offsetY);
                            }
                            if (entity.description.type.outline) {
                                renderContext.strokeStyle = COLOR_WHITE;
                                renderContext.lineWidth = state.outlineWidth;
                                renderContext.strokeText(entity.description.type.character, entity.offsetX, entity.offsetY);
                            }
                            renderContext.restore();

                            // apply animations
                            let previousCanvas = entity.render;

                            for (let animationId in entity.animations) {
                                let animation = entity.animations[animationId];
                                let done = true;
                                for (let tween of animation.tweens) {
                                    let t: number;
                                    if (tween.repeat) {
                                        t = (animation.age % tween.durationMillis) / tween.durationMillis;
                                        done = false;
                                    } else {
                                        t = Math.min(1, animation.age / tween.durationMillis);
                                        if (t < 1) {
                                            done = false;
                                        }
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
                                if (done) {
                                    delete entity.animations[animationId];
                                }
                            }
                            if (previousCanvas != entity.render) {
                                // re-rotate/flip
                                renderContext.clearRect(0, 0, entity.width, entity.height);
                                renderContext.save();
                                renderContext.translate(entity.width / 2, entity.height / 2);
                                if (orientationTransformation.flipY) {
                                    renderContext.scale(1, -1);
                                }
                                renderContext.rotate(Math.PI / 2 * orientationTransformation.rotate);
                                renderContext.drawImage(previousCanvas, -entity.width / 2, -entity.height / 2);
                                renderContext.restore();
                            //entity.render = previousCanvas;
                            //entity.renderContext = previousCanvas.getContext('2d');
                            }

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
        context.restore();
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


        function update(state: ILevelPlayState, duration: number): boolean {
            let result: boolean;
            let checkEntities: ILevelPlayEntity[] = [];
            for (let i = state.entities.length; i > 0;) {
                i--;
                let entity = state.entities[i];
                entity.updateStartOrientation = entity.orientation;
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
                    if (updateResult.newState) {
                        result = nextStateCallback(updateResult.newState);
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

                    rotateRenderMask(entity, entity.updateStartOrientation, entity.orientation);

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
                        /*
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
                        */
                        handleCollision(minCheckEntityCollisionHandler, minCollisionTime, checkEntity, minCollisionEntity, newCheckEntities);
                        handleCollision(minCollisionEntityCollisionHandler, minCollisionTime, minCollisionEntity, checkEntity, newCheckEntities);
                        // TODO exclude from future collisions if the collisions are at zero duration
                    }
                }
                checkEntities = newCheckEntities;
            } while (checkEntities.length);
            return result;
        }

        function handleCollision(collisionHandler: ICollisionHandler, collisionTime: number, entity: ILevelPlayEntity, withEntity: ILevelPlayEntity, checkEntities: ILevelPlayEntity[]) {
            if (collisionHandler) {

                if (collisionHandler.collisionResolution.type == COLLISION_RESOLUTION_TYPE_SOLID) {
                    levelPlayEntityMatrixRemove(state.matrix, state.tileSize, entity);

                    entity.x = entity.updateStartX + (entity.velocityX * collisionTime) / state.tileSize;
                    entity.y = entity.updateStartY + (entity.velocityY * collisionTime) / state.tileSize;
                    if (entity.velocityX != 0 || entity.velocityY != 0) {
                        entity.velocityX = 0;
                        entity.velocityY = 0;
                    } else {
                        // reset the rotation too!
                        rotateRenderMask(entity, entity.orientation, entity.updateStartOrientation);
                        entity.orientation = entity.updateStartOrientation;
                        // TODO remove any rotation animations
                    }

                    levelPlayEntityMatrixAdd(state.matrix, state.tileSize, entity);
                    setEntityDirty(entity);

                } else if (collisionHandler.collisionResolution.type == COLLISION_RESOLUTION_TYPE_EAT) {
                    withEntity.dead = true;
                }

                if (entity.updateDurationOffset < collisionTime) {
                    entity.updateDurationOffset = collisionTime;
                    // this might be getting added multiple times
                    if (!arrayContains(checkEntities, entity)) {
                        checkEntities.push(entity);
                    }
                }
            }
        }

        function rotateRenderMask(entity: ILevelPlayEntity, fromOrientation: Orientation, toOrientation: Orientation) {
            if (toOrientation != fromOrientation) {
                let fromOrientationTransformation = ORIENTATION_TRANSFORMATIONS[fromOrientation];
                let toOrientationTransformation = ORIENTATION_TRANSFORMATIONS[toOrientation];
                let fromCount = (4 - fromOrientationTransformation.rotate) % 4;
                rotate(entity, fromCount);
                if (fromOrientationTransformation.flipY && !toOrientationTransformation.flipY || !fromOrientationTransformation.flipY && toOrientationTransformation.flipY) {
                    flipY(entity);
                }
                rotate(entity, toOrientationTransformation.rotate);
            }
        }

        function rotate(entity: ILevelPlayEntity, count: number) {
            while (count > 0) {
                count--;
                let width = entity.renderMask.width;
                let height = entity.renderMask.height;
                let originalData = entity.renderMask.getContext('2d').getImageData(0, 0, width, height);
                entity.renderMask.width = height;
                entity.renderMask.height = width;
                let context = entity.renderMask.getContext('2d');
                let newData = context.getImageData(0, 0, height, width);
                for (let y = 0; y < height; y++) {
                    let originalYoff = y * width * 4;
                    let newX = (height - y - 1);
                    let newXoff = newX * 4;
                    for (let x = 0; x < width; x++) {
                        let originalXoff = originalYoff + x * 4;
                        let newY = x;
                        let newYoff = newY * height * 4 + newXoff;
                        for (let i = 0; i < 4; i++) {
                            newData.data[newYoff + i] = originalData.data[originalXoff + i];
                        }
                    }
                }
                context.putImageData(newData, 0, 0);
            }
        }

        function flipY(entity: ILevelPlayEntity) {
            let width = entity.renderMask.width;
            let height = entity.renderMask.height;
            let context = entity.renderMask.getContext('2d');
            let data = context.getImageData(0, 0, width, height);
            let midY = Math.floor(height / 2);
            for (let y = 0; y < midY; y++) {
                let newY = height - y - 1;
                if (newY != y) {
                    let originalYoff = y * width * 4;
                    let newYoff = newY * width * 4;
                    for (let x = 0; x < width; x++) {
                        let xoff = x * 4;
                        let originalXoff = originalYoff + xoff;
                        let newXoff = newYoff + xoff;
                        for (let i = 0; i < 4; i++) {
                            let tmp = data.data[newXoff + i];
                            data.data[newXoff + i] = data.data[originalXoff + i];
                            data.data[originalXoff + i] = tmp;
                        }
                    }
                }
            }
            context.putImageData(data, 0, 0);

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
            let done = update(state, diff);
            if (!done) {
                render(state, dirtyTiles);
                runner.animationFrameRequestId = requestAnimationFrame(animationCallback);
            }
        };

        var animationFrameRequestId = requestAnimationFrame(animationCallback);

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
        let xDown;
        let yDown;
        let minDiff = state.tileSize;
        let touchStart = function (evt: TouchEvent) {
            let touch = evt.touches[0];
            xDown = touch.clientX;
            yDown = touch.clientY;
            evt.preventDefault();
        };
        let touchMove = function (evt: TouchEvent) {
            if (xDown && yDown) {
                let touch = evt.touches[0];
                let xDiff = touch.clientX - xDown;
                let yDiff = touch.clientY - yDown;

                let xDiffAbs = Math.abs(xDiff);
                let yDiffAbs = Math.abs(yDiff);

                if (xDiffAbs > minDiff || yDiffAbs > minDiff) {
                    let input: InputAtomicId;
                    if (xDiffAbs > yDiffAbs) {
                        if (xDiff > 0) {
                            input = INPUT_ATOMIC_ID_RIGHT;
                        } else {
                            input = INPUT_ATOMIC_ID_LEFT;
                        }
                    } else {
                        if (yDiff > 0) {
                            input = INPUT_ATOMIC_ID_DOWN;
                        } else {
                            input = INPUT_ATOMIC_ID_UP;
                        }
                    }
                    inputs[input].unread = true;

                    xDown = null;
                    yDown = null;
                }
            }
            evt.preventDefault();
        };
        let touchEnd = function (evt: TouchEvent) {
            if (xDown && yDown) {
                // it's a tap
                inputs[INPUT_ATOMIC_ID_ACTION].unread = true;
            }
            evt.preventDefault();
        };

        let eventListeners: { [_: string]: EventListener } = {};
        eventListeners['touchstart'] = touchStart;
        eventListeners['touchmove'] = touchMove;
        eventListeners['touchend'] = touchEnd;

        for (let key in eventListeners) {
            document.addEventListener(key, eventListeners[key]);
        }

        var runner: ILevelPlayStateRunner = {
            animationFrameRequestId: animationFrameRequestId,
            eventListeners: eventListeners
        };

        return {
            type: STATE_LEVEL_PLAY,
            value: runner
        };
    }
}