function levelPlayStartFactory(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    entityUpdate: (mind: IRecord<LevelPlayEntityMind>, state: ILevelPlayState, entity: ILevelPlayEntity) => ILevelPlayEntityMindUpdateResult,
    inputs: { [_: number]: IInputAtomic },
    maxCollisionSteps: number,
    recordEasingFunction: IRecordEasingFunction,
    recordContextEffectFunction: IRecordContextEffectFunction,
    recordAnimationTweenFactory: IRecordAnimationTweenFactory,
    collisionHandlerSearch: ICollisionHandlerSearch, 
    displayTimeMillis: number
): IStateStartFunction {

    function render(context: CanvasRenderingContext2D, state: ILevelPlayState, dirtyTiles: ILevelPlayMatrix<boolean>, dx: number, dy: number, redraw?: boolean): void {
        let textX: number;
        let textY: number;
        let textStrokeWidth: number;
        let remainingDisplayTimeMillis = displayTimeMillis - state.ageMillis; 
        if (remainingDisplayTimeMillis > 0) {
            let levelName = state.levelName;
            context.font = state.levelFont;
            let textHeight = state.tileSize * 2;
            let textWidth = context.measureText(levelName).width;
            textStrokeWidth = state.outlineWidth;
            textX = (canvas.width - textWidth) / 2;
            textY = (canvas.height - textHeight) / 2;
            let r: IRectangle = {
                x: textX - dx - textStrokeWidth / 2,
                y: textY - dy - textStrokeWidth / 2,
                width: textWidth + textStrokeWidth,
                height: textHeight + textStrokeWidth
            };
            levelPlayMatrixIterate(dirtyTiles, state.tileSize, r, dirtyTileSetter);
        }

        context.save();        
        context.translate(dx, dy);
        for (let tx = dirtyTiles.width; tx > 0;) {
            tx--;
            let dirtyTilesX = dirtyTiles.tiles[tx];
            let entitiesX = state.matrix.tiles[tx];
            let x = tx * state.tileSize;
            for (let ty = dirtyTiles.height; ty > 0;) {
                ty--;
                let dirtyTileXY = dirtyTilesX[ty] || redraw;
                if (dirtyTileXY) {
                    let entitiesXY = entitiesX[ty];
                    let y = ty * state.tileSize;

                    context.fillStyle = state.levelBackground;
                    context.fillRect(x, y, state.tileSize, state.tileSize);

                    for (let entity of entitiesXY) {
                        if (!entity.renderNotDirty) {
                            let renderContext = entity.renderContext;
                            renderContext.clearRect(0, 0, entity.width, entity.height);

                            // render unrotated/flipped
                            
                            let orientationTransformation = ORIENTATION_TRANSFORMATIONS[entity.orientation];
                            renderContext.save();
                            renderContext.translate(entity.width / 2, entity.height / 2);
                            if (orientationTransformation.flipY) {
                                renderContext.scale(1, -1);
                            }
                            renderContext.rotate(orientationTransformation.rotate * -Math.PI / 2);
                            renderContext.drawImage(entity.renderMask, -entity.width / 2, -entity.height / 2);
                            renderContext.restore();
                            renderContext.save();
                            renderContext.globalCompositeOperation = 'source-in';
                            let background = entity.description.type.backgroundColor;
                            if (background) {
                                renderContext.fillStyle = background;
                            } else {
                                renderContext.fillStyle = entity.foregroundFill;
                            }
                            renderContext.fillRect(0, 0, entity.width, entity.height);
                            renderContext.globalCompositeOperation = 'source-atop';
                            if (background) {
                                renderContext.fillStyle = entity.foregroundFill;
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
                                    recordContextEffectFunction(
                                        tween.effect,
                                        p,
                                        recordContextEffectRenderCanvasFactory(previousCanvas),
                                        canvas,
                                        context
                                    );
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
                                renderContext.rotate(Math.PI / 2 * orientationTransformation.rotate);
                                if (orientationTransformation.flipY) {
                                    renderContext.scale(1, -1);
                                }
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
                        /*
                        if (entity.description.mind.value ) {
                            let points: IPoint[] = entity.description.mind.value['lastDecisionPath'];
                            if (points) {
                                context.fillStyle = entity.description.type.foregroundColor;
                                for (let i in points) {
                                    let point = points[i];
                                    context.globalAlpha = parseInt(i) / points.length;
                                    context.fillText(entity.description.type.character, point.x * state.tileSize, point.y * state.tileSize);
                                }
                                context.globalAlpha = 1;
                            }
                        }
                        */
                    }

                    dirtyTilesX[ty] = false;
                }
            }
        }
        context.restore();
        if (remainingDisplayTimeMillis > 0) {
            context.save();
            context.textBaseline = 'top';
            let t = remainingDisplayTimeMillis / displayTimeMillis;
            let p = recordEasingFunction({
                bounce: true,
                type: EASING_QUADRATIC_OUT
            }, t);
            context.globalAlpha = p;
            context.fillStyle = state.levelColors[2];
            context.fillText(state.levelName, textX, textY);
            context.lineWidth = textStrokeWidth;
            context.strokeStyle = '#FFF';
            context.strokeText(state.levelName, textX, textY);
            context.restore();
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

        function update(state: ILevelPlayState, duration: number, paused: boolean): boolean {
            let result: boolean;
            let checkEntities: ILevelPlayEntity[] = [];
            for (let i = state.entities.length; i > 0;) {
                i--;
                let entity = state.entities[i];
                entity.updateStartX = entity.x;
                entity.updateStartY = entity.y;
                entity.excluded = [];
                if (!paused && (entity.description.mind.type == MIND_PLAYER_1 || state.ageMillis > displayTimeMillis)) {
                    entity.updateStartOrientation = entity.orientation;
                    let updateResult = entityUpdate(entity.description.mind, state, entity);
                    // deal with new entities
                    if (updateResult) {
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
                        if (updateResult.newEntities) {
                            for (let newEntity of updateResult.newEntities) {
                                state.entities.push(newEntity);
                                // NOTE do we need to check the new entity?
                            }
                        }
                        if (updateResult.newState) {
                            nextStateCallback(updateResult.newState);
                            result = true;
                        }
                        if (updateResult.newEntityState != entity.state) {
                            delete entity.animations[ENTITY_ANIMATION_BASE];
                            entity.state = updateResult.newEntityState;
                        }
                        if (updateResult.newDirection) {
                            // TODO orientation should be keyed not just off direction, but also movement type (flying monsters don't turn)
                            let newOrientation = ORIENTATION_TRANSFORMATIONS[entity.orientation].next[updateResult.newDirection];
                            if (newOrientation != entity.orientation) {
                                //result.newAnimations['y'] = animationTurn(200, entity.orientation, newOrientation, entity.width, entity.height);
                                let tweens = animationTurnTweenFactory({
                                    durationMillis: 200,
                                    orientationFrom: entity.orientation,
                                    orientationTo: newOrientation
                                }, entity.width, entity.height);
                                entity.animations[ENTITY_ANIMATION_TURN] = {
                                    tweens: tweens,
                                    age: 0
                                };
                                entity.orientation = newOrientation;
                            }
                            let vx: number;
                            let vy: number;
                            switch (updateResult.newDirection) {
                                case DIRECTION_NORTH:
                                    vx = 0;
                                    vy = -entity.description.type.speed;
                                    break;
                                case DIRECTION_SOUTH:
                                    vx = 0;
                                    vy = entity.description.type.speed;
                                    break;
                                case DIRECTION_EAST:
                                    vx = entity.description.type.speed;
                                    vy = 0;
                                    break;
                                case DIRECTION_WEST:
                                    vx = -entity.description.type.speed;
                                    vy = 0;
                                    break;
                            }
                            entity.velocityX = vx;
                            entity.velocityY = vy;
                        }
                        if (updateResult.dead) {
                            entity.dead = true;
                        }
                    }
                    // deal with dead entities
                    levelPlayEntityRotateRenderMask(entity, entity.updateStartOrientation, entity.orientation);

                    if (entity.velocityX || entity.velocityY) {
                        levelPlayEntityMatrixRemove(state.matrix, state.tileSize, entity);
                        setEntityDirty(entity);

                        entity.x += entity.velocityX * duration * state.tileSize;
                        entity.y += entity.velocityY * duration * state.tileSize;
                        checkEntities.push(entity);

                        levelPlayEntityMatrixAdd(state.matrix, state.tileSize, entity);
                        setEntityDirty(entity);

                    }
                }
                if (entity.dead) {
                    state.entities.splice(i, 1);
                    setEntityDirty(entity);
                    levelPlayEntityMatrixRemove(state.matrix, state.tileSize, entity);
                } else if (!entity.animations[ENTITY_ANIMATION_BASE] && entity.state) {
                    let animation = entity.description.type.animations[entity.state];
                    if (animation) {
                        entity.animations[ENTITY_ANIMATION_BASE] = {
                            tweens: recordAnimationTweenFactory(animation, entity.width, entity.height),
                            age: 0
                        }
                    }
                }

                let first = true;
                for (let animationId in entity.animations) {
                    let animation = entity.animations[animationId];
                    if (first) {
                        setEntityDirty(entity);
                        first = false;
                    }
                    // TODO only update repeating animations if paused
                    animation.age += duration;
                }
            }

            // deal with collisions
            if (!paused) {
                do {
                    let newCheckEntities: ILevelPlayEntity[] = [];

                    for (let i = checkEntities.length; i > 0;) {
                        i--;
                        let checkEntity = checkEntities[i];
                        let minCollisionTime: number;
                        let minCollisionEntity: ILevelPlayEntity;
                        let minCollisionEntityCollisionResolution: IRecord<CollisionResolution>;
                        let minCheckEntityCollisionResolution: IRecord<CollisionResolution>;
                        let collidableEntities = levelPlayMatrixList(state.matrix, state.tileSize, checkEntity);
                        for (let collidableEntity of collidableEntities) {

                            // do they overlap?
                            if (
                                checkEntity != collidableEntity &&
                                !checkEntity.dead &&
                                !collidableEntity.dead &&
                                !arrayContains(collidableEntity.excluded, checkEntity) &&
                                overlaps(checkEntity, checkEntity, collidableEntity, collidableEntity)
                            ) {

                                // do they interact in any way?
                                let checkEntityCollisionResolution = collisionHandlerSearch(checkEntity.description.type, collidableEntity.description.type);
                                let collisionResolution = collisionHandlerSearch(collidableEntity.description.type, checkEntity.description.type);

                                if (checkEntityCollisionResolution || collisionResolution) {
                                    // work out when they collided by stepping back 
                                    let startTime = 0;
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
                                        minCollisionEntityCollisionResolution = collisionResolution;
                                        minCheckEntityCollisionResolution = checkEntityCollisionResolution;
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
                            handleCollision(minCheckEntityCollisionResolution, minCollisionTime, checkEntity, minCollisionEntity, newCheckEntities);
                            handleCollision(minCollisionEntityCollisionResolution, minCollisionTime, minCollisionEntity, checkEntity, newCheckEntities);
                            // TODO exclude from future collisions if the collisions are at zero duration
                        }
                    }
                    checkEntities = newCheckEntities;
                } while (checkEntities.length);

            }
            return result;
        }

        function handleCollision(collisionResolution: IRecord<CollisionResolution>, collisionTime: number, entity: ILevelPlayEntity, withEntity: ILevelPlayEntity, checkEntities: ILevelPlayEntity[]) {
            // TODO move to collision handler delegate
            entity.excluded.push(withEntity);
            if (!arrayContains(checkEntities, entity)) {
                checkEntities.push(entity);
            }

            if (collisionResolution) {
                if (collisionResolution.type == COLLISION_RESOLUTION_TYPE_SOLID) {
                    levelPlayEntityMatrixRemove(state.matrix, state.tileSize, entity);

                    entity.x = entity.updateStartX + (entity.velocityX * collisionTime) / state.tileSize;
                    entity.y = entity.updateStartY + (entity.velocityY * collisionTime) / state.tileSize;
                    if (entity.velocityX != 0 || entity.velocityY != 0) {
                        entity.velocityX = 0;
                        entity.velocityY = 0;
                    } else {
                        // reset the rotation too!
                        levelPlayEntityRotateRenderMask(entity, entity.orientation, entity.updateStartOrientation);
                        entity.orientation = entity.updateStartOrientation;
                        delete entity.animations[ENTITY_ANIMATION_TURN];
                    }

                    levelPlayEntityMatrixAdd(state.matrix, state.tileSize, entity);
                    setEntityDirty(entity);

                } else if (collisionResolution.type == COLLISION_RESOLUTION_TYPE_EAT) {
                    withEntity.dead = true;
                }

            }
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

        let lastUpdate = performance.now();
        let renderer: IRecordContextEffectRenderFunction = function (renderContext: CanvasRenderingContext2D, x: number, y: number) {
            render(renderContext, state, dirtyTiles, x + state.renderOffsetX, y + state.renderOffsetY, true);
        };
        let animationCallback: FrameRequestCallback = function (now: number) {
            // register next one first so it can be cancelled
            runner.animationFrameRequestId = requestAnimationFrame(animationCallback);
            var diff = Math.max(1, Math.min(100, now - lastUpdate));
            lastUpdate = now;
            state.ageMillis += diff;

            //let dy = Math.max(0, state.previousCanvas.height - state.ageMillis);
            //let transitioning = dy > 0;
            let transitioning = state.tween != null;
            if (!update(state, diff, transitioning)) {
                if (transitioning) {
                    let t = state.ageMillis / state.tween.durationMillis;
                    let tween = state.tween;
                    if (t >= 1) {
                        t = 1;
                        state.tween = null;
                    }
                    let p = recordEasingFunction(tween.easing, t);
                    recordContextEffectFunction(tween.effect, p, renderer, canvas, context);
                } else {
                    render(context, state, dirtyTiles, state.renderOffsetX, state.renderOffsetY);
                }
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