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
    displayTimeMillis: number, 
    gravity: number,
    saveLevelDepthFunction: IStorageSaveLevelDepthFunction,
    eatSoundEffect: ISoundEffect,
    deathSoundEffect: ISoundEffect
): IStateStartFunction {

    function render(context: CanvasRenderingContext2D, state: ILevelPlayState, dirtyTiles: ILevelPlayMatrix<boolean>, dx: number, dy: number, redraw?: boolean): void {
        let textX: number;
        let textY: number;
        let textStrokeWidth: number;

        let textTime: number;
        let text: string;
        let textBounce: boolean;
        let remainingDisplayTimeMillis = displayTimeMillis - state.ageMillis; 
        if (remainingDisplayTimeMillis > 0) {
            text = state.levelName;
            textTime = remainingDisplayTimeMillis / displayTimeMillis;
            textBounce = true;
        } else if (state.gameOverTimeMillis) {
            text = "YOU DIED";
            textTime = min(1, (state.ageMillis - state.gameOverTimeMillis) / displayTimeMillis);
        } else if (state.levelWinTimeMillis) {
            text = "SUCCESS";
            textTime = min(1, (state.ageMillis - state.levelWinTimeMillis) / displayTimeMillis);
        }

        if (text) {
            context.font = state.levelFont;
            let textHeight = state.tileSize * 2;
            let textWidth = context.measureText(text).width;
            textStrokeWidth = state.ow;
            textX = (canvas.width - textWidth) / 2;
            textY = (canvas.height - textHeight) / 2;
            let r: IRectangle = {
                x: textX - dx - textStrokeWidth / 2,
                y: textY - dy - textStrokeWidth / 2,
                w: textWidth + textStrokeWidth,
                h: textHeight + textStrokeWidth
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

                            // do we have animations
                            let renderContext = entity.renderContext;
                            renderContext.clearRect(0, 0, entity.w, entity.h);

                            // render unrotated/flipped

                            let orientationTransformation = ORIENTATION_TRANSFORMATIONS[entity.o];
                            renderContext.save();
                            renderContext.translate(entity.w / 2, entity.h / 2);
                            if (orientationTransformation.flipY) {
                                renderContext.scale(1, -1);
                            }
                            renderContext.rotate(orientationTransformation.r * -pi / 2);
                            renderContext.drawImage(entity.renderMask, -entity.w / 2, -entity.h / 2);
                            renderContext.restore();
                            renderContext.save();
                            renderContext.globalCompositeOperation = 'source-in';
                            let background = entity.d.t.bg;
                            if (background) {
                                renderContext.fillStyle = background;
                            } else {
                                renderContext.fillStyle = entity.foregroundFill;
                            }
                            renderContext.fillRect(0, 0, entity.w, entity.h);
                            renderContext.globalCompositeOperation = 'source-atop';
                            if (background) {
                                renderContext.fillStyle = entity.foregroundFill;
                                renderContext.fillText(entity.d.t.character, entity.offx, entity.offy);
                            }
                            if (entity.d.t.outline) {
                                renderContext.strokeStyle = COLOR_WHITE;
                                renderContext.lineWidth = state.ow;
                                renderContext.strokeText(entity.d.t.character, entity.offx, entity.offy);
                            }
                            renderContext.restore();

                            // apply animations
                            let previousCanvas = entity.render;

                            for (let animationId in entity.anims) {
                                let animation = entity.anims[animationId];
                                let done = true;
                                for (let tween of animation.tweens) {
                                    let t: number;
                                    if (tween.repeat) {
                                        t = (animation.age % tween.durationMillis) / tween.durationMillis;
                                        done = false;
                                    } else {
                                        t = min(1, animation.age / tween.durationMillis);
                                        if (t < 1) {
                                            done = false;
                                        }
                                    }
                                    let p = recordEasingFunction(tween.easing, t);

                                    let canvas = newCanvas(previousCanvas.width, previousCanvas.height);
                                    let context = getContext(canvas);
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
                                    if (animationId == ENTITY_ANIMATION_BASE && !entity.state) {
                                        entity.dead = true;
                                    } else {
                                        delete entity.anims[animationId];
                                    }
                                }
                            }
                            // only required if the thing that moves doesn't have an animation...which it always should
                            /*
                            if (entity.render == previousCanvas) {
                                entity.render = <HTMLCanvasElement>document.createElement('canvas');
                                entity.render.width = previousCanvas.width;
                                entity.render.height = previousCanvas.height;
                                renderContext = entity.render.getContext('2d');
                                entity.renderContext = renderContext;
                            }
                            */
                            if (entity.render != previousCanvas) {
                                // re-rotate/flip
                                renderContext.clearRect(0, 0, entity.w, entity.h);
                                renderContext.save();
                                renderContext.translate(entity.w / 2, entity.h / 2);
                                renderContext.rotate(pi / 2 * orientationTransformation.r);
                                if (orientationTransformation.flipY) {
                                    renderContext.scale(1, -1);
                                }
                                renderContext.drawImage(previousCanvas, -entity.w / 2, -entity.h / 2);
                                renderContext.restore();
                                //entity.render = previousCanvas;
                                //entity.renderContext = previousCanvas.getContext('2d');

                                entity.renderNotDirty = true;
                            }
                        }
                        let sx = max(0, x - entity.x);
                        let sy = max(0, y - entity.y);
                        let dx = max(entity.x, x);
                        let dy = max(entity.y, y);
                        let sw = min(state.tileSize - (dx - x), entity.w - sx);
                        let sh = min(state.tileSize - (dy - y), entity.h - sy);
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
        
        if (text) {
            context.save();
            context.textBaseline = 'top';
            let p = recordEasingFunction({
                bounce: textBounce,
                t: EASING_QUADRATIC_OUT
            }, textTime);
            context.globalAlpha = p;
            context.fillStyle = state.levelColors[2];
            context.fillText(text, textX, textY);
            context.lineWidth = textStrokeWidth;
            context.strokeStyle = COLOR_WHITE;
            context.strokeText(text, textX, textY);
            context.restore();
        }
    }

    function dirtyTileSetter() {
        return true;
    }


    return function (state: ILevelPlayState, nextStateCallback: IStateCompleteCallback): IRecord<ILevelPlayStateRunner> {

        for (let inputId in inputs) {
            let input = inputs[inputId];
            input.unread = false;
            input.a = false;
            input.t = 0;
        }

        let intersectionCanvas = newCanvas(state.tileSize, state.tileSize);
        let intersectionContext = getContext(intersectionCanvas);

        let dirtyTiles = levelPlayMatrixCreate(state.width, state.height, function () {
            return true;
        });

        function setEntityDirty(entity: ILevelPlayEntity) {
            entity.renderNotDirty = false;
            levelPlayMatrixIterate(dirtyTiles, state.tileSize, entity, dirtyTileSetter);
        }

        function setEntityState(entity: ILevelPlayEntity, newEntityState: EntityState) {
            if (entity.state != newEntityState) {
                if (entity.anims[ENTITY_ANIMATION_BASE]) {
                    delete entity.anims[ENTITY_ANIMATION_BASE];
                }
                entity.state = newEntityState;
                if (newEntityState == ENTITY_STATE_DYING) {
                    let particles = state.particleFactory(
                        entity.x + entity.w / 2,
                        entity.y + entity.h / 2,
                        entity.d.t.fg,
                        ceil((entity.w * 8) / state.tileSize),
                        entity.vx,
                        entity.vy
                    );
                    for (let particle of particles) {
                        particle.excluded = [];
                        state.es.push(particle);
                        setEntityDirty(particle);
                        levelPlayEntityMatrixAdd(state.matrix, state.tileSize, particle);
                    }
                    entity.vx = 0;
                    entity.vy = 0;
                }
            }
        }

        let sideCounts: { [_: number]: number } = {};

        function update(state: ILevelPlayState, duration: number, paused: boolean): boolean {
            let result: boolean;
            let checkEntities: ILevelPlayEntity[] = [];

            state.energy = max(0, state.energy - duration);

            for (let side of ALL_SIDES) {
                sideCounts[side] = 0;
            }

            for (let i = state.es.length; i > 0;) {
                i--;
                let entity = state.es[i];
                entity.updateStartX = entity.x;
                entity.updateStartY = entity.y;
                entity.excluded = [];
                let sideCount = sideCounts[entity.d.side] + 1;
                sideCounts[entity.d.side] = sideCount;

                if (!paused && (entity.d.t.classification == CLASSIFICATION_PARTICLE || entity.d.mind.t == MIND_PLAYER_1 || state.ageMillis > displayTimeMillis)) {
                    entity.updateStartOrientation = entity.o;
                    if (entity.state) {
                        let updateResult = entityUpdate(entity.d.mind, state, entity);
                        // deal with new entities
                        if (updateResult) {
                            if (updateResult.deletedAnimationIds) {
                                for (let deletedAnimationId of updateResult.deletedAnimationIds) {
                                    delete entity.anims[deletedAnimationId];
                                }
                            }
                            if (updateResult.newAnimations) {
                                for (let newAnimationId in updateResult.newAnimations) {
                                    let newAnimation = updateResult.newAnimations[newAnimationId];
                                    newAnimation.age = 0;
                                    entity.anims[newAnimationId] = newAnimation;
                                }
                            }
                            if (updateResult.newEntities) {
                                for (let newEntity of updateResult.newEntities) {
                                    newEntity.excluded = [];
                                    state.es.push(newEntity);
                                    // NOTE do we need to check the new entity?
                                    setEntityDirty(newEntity);
                                    levelPlayEntityMatrixAdd(state.matrix, state.tileSize, newEntity);
                                }
                            }
                            if (updateResult.newState) {
                                nextStateCallback(updateResult.newState);
                                result = true;
                            }
                            setEntityState(entity, updateResult.newEntityState);
                            if (updateResult.newDirection) {
                                // TODO orientation should be keyed not just off direction, but also movement type (flying monsters don't turn)
                                let newOrientation = ORIENTATION_TRANSFORMATIONS[entity.o].n[updateResult.newDirection];
                                if (newOrientation != entity.o) {
                                    //result.newAnimations['y'] = animationTurn(200, entity.orientation, newOrientation, entity.width, entity.height);
                                    let tweens = animationTurnTweenFactory({
                                        durationMillis: 200,
                                        orientationFrom: entity.o,
                                        orientationTo: newOrientation
                                    }, entity.w, entity.h);
                                    entity.anims[ENTITY_ANIMATION_TURN] = {
                                        tweens: tweens,
                                        age: 0
                                    };
                                    entity.o = newOrientation;
                                }
                                let vx: number;
                                let vy: number;
                                switch (updateResult.newDirection) {
                                    case DIRECTION_NORTH:
                                        vx = 0;
                                        vy = -entity.d.t.sp;
                                        break;
                                    case DIRECTION_SOUTH:
                                        vx = 0;
                                        vy = entity.d.t.sp;
                                        break;
                                    case DIRECTION_EAST:
                                        vx = entity.d.t.sp;
                                        vy = 0;
                                        break;
                                    case DIRECTION_WEST:
                                        vx = -entity.d.t.sp;
                                        vy = 0;
                                        break;
                                }
                                entity.vx = vx;
                                entity.vy = vy;
                            }
                            if (updateResult.dead) {
                                entity.dead = true;
                            }
                        }
                        // deal with dead entities
                        levelPlayEntityRotateRenderMask(entity, entity.updateStartOrientation, entity.o);
                    }

                    if (entity.gravity) {
                        entity.vy += gravity * duration;
                    }

                    if (entity.vx || entity.vy) {
                        levelPlayEntityMatrixRemove(state.matrix, state.tileSize, entity);
                        setEntityDirty(entity);

                        entity.x += entity.vx * duration * state.tileSize;
                        entity.y += entity.vy * duration * state.tileSize;
                        checkEntities.push(entity);

                        levelPlayEntityMatrixAdd(state.matrix, state.tileSize, entity);
                        setEntityDirty(entity);

                    }
                }

                if (!entity.anims[ENTITY_ANIMATION_BASE]) {
                    let animation = entity.d.t.animations[entity.state];
                    if (animation) {
                        let tweens = recordAnimationTweenFactory(animation, entity.w, entity.h)
                        entity.anims[ENTITY_ANIMATION_BASE] = {
                            tweens: tweens,
                            age: 0
                        }
                    }
                }
                if (entity.dead) {
                    state.es.splice(i, 1);
                    setEntityDirty(entity);
                    levelPlayEntityMatrixRemove(state.matrix, state.tileSize, entity);
                } 


                let first = true;
                for (let animationId in entity.anims) {
                    let animation = entity.anims[animationId];
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
                                !checkEntity.dead && checkEntity.state &&
                                !collidableEntity.dead && collidableEntity.state &&
                                !arrayContains(collidableEntity.excluded, checkEntity) &&
                                overlaps(checkEntity, checkEntity, collidableEntity, collidableEntity)
                            ) {

                                // do they interact in any way?
                                let checkEntityCollisionResolution = collisionHandlerSearch(checkEntity, collidableEntity);
                                let collisionResolution = collisionHandlerSearch(collidableEntity, checkEntity);

                                if (checkEntityCollisionResolution || collisionResolution) {
                                    // work out when they collided by stepping back 
                                    let startTime = 0;
                                    let endTime = duration;
                                    let entityBounds: any = {
                                        width: collidableEntity.w,
                                        height: collidableEntity.h
                                    };
                                    let checkEntityBounds: any = {
                                        width: checkEntity.w,
                                        height: checkEntity.h
                                    };
                                    for (let step = 0; step < maxCollisionSteps; step++) {
                                        let collisionTime = (endTime + startTime) / 2;

                                        entityBounds.x = collidableEntity.updateStartX + (collidableEntity.vx * collisionTime) / state.tileSize;
                                        entityBounds.y = collidableEntity.updateStartY + (collidableEntity.vy * collisionTime) / state.tileSize;

                                        checkEntityBounds.x = checkEntity.updateStartX + (checkEntity.vx * collisionTime) / state.tileSize;
                                        checkEntityBounds.y = checkEntity.updateStartY + (checkEntity.vy * collisionTime) / state.tileSize;

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

            // deal with exceptional counts
            if (!sideCounts[SIDE_PLAYER]) {
                // game over                
                if (!state.gameOverTimeMillis) {
                    state.gameOverTimeMillis = state.ageMillis;
                } else {
                    // check the inputs to see if we can restart the level
                    for (let inputId in inputs) {
                        let input = inputs[inputId];
                        if (input.t > state.gameOverTimeMillis) {
                            state.key.suppressScroll = true;
                            nextStateCallback({
                                t: STATE_LEVEL_PLAY,
                                v: state.key
                            });
                            break;
                        }
                    }
                }
            } else if (!sideCounts[SIDE_MONSTER] || !sideCounts[SIDE_COLLECT]) {
                // no monsters or no collectables - level completed
                if (!state.levelWinTimeMillis) {
                    deathSoundEffect(1);
                    saveLevelDepthFunction(state.key.x, state.key.y, state.z + 1);
                    state.levelWinTimeMillis = state.ageMillis;
                    for (let entity of state.es) {
                        if (entity.d.side == SIDE_COLLECT || entity.d.side == SIDE_MONSTER) {
                            // blow it up!
                            setEntityState(entity, ENTITY_STATE_DYING);
                        }
                    }
                    // TODO record the victory
                }
            }


            return result;
        }

        function handleCollision(collisionResolution: IRecord<CollisionResolution>, collisionTime: number, entity: ILevelPlayEntity, withEntity: ILevelPlayEntity, checkEntities: ILevelPlayEntity[]) {
            // TODO move to collision handler delegate
            entity.excluded.push(withEntity);

            if (collisionResolution) {
                if (!arrayContains(checkEntities, entity)) {
                    checkEntities.push(entity);
                }
                if (collisionResolution.t == COLLISION_RESOLUTION_TYPE_SOLID) {
                    levelPlayEntityMatrixRemove(state.matrix, state.tileSize, entity);

                    entity.x = entity.updateStartX + (entity.vx * collisionTime) / state.tileSize;
                    entity.y = entity.updateStartY + (entity.vy * collisionTime) / state.tileSize;
                    if (entity.vx != 0 || entity.vy != 0) {
                        entity.vx = 0;
                        entity.vy = 0;
                    } else {
                        // reset the rotation too!
                        levelPlayEntityRotateRenderMask(entity, entity.o, entity.updateStartOrientation);
                        entity.o = entity.updateStartOrientation;
                        delete entity.anims[ENTITY_ANIMATION_TURN];
                    }

                    levelPlayEntityMatrixAdd(state.matrix, state.tileSize, entity);
                    setEntityDirty(entity);

                } else if (collisionResolution.t == COLLISION_RESOLUTION_TYPE_EAT) {
                    withEntity.dead = true;
                    eatSoundEffect(state.energy / 9999);
                    state.energy += 700;
                } else if (collisionResolution.t == COLLISION_RESOLUTION_TYPE_CONFER_ENTITY_STATE) {
                    let collisionResolutionConferEntityState = <ICollisionResolutionConferEntityState>collisionResolution.v;
                    if (withEntity.state != collisionResolutionConferEntityState.entityState) {
                        setEntityState(withEntity, collisionResolutionConferEntityState.entityState);
                        deathSoundEffect(0);
                    }
                }

            }
        }

        function overlaps(entity1: ILevelPlayEntity, bounds1: IRectangle, entity2: ILevelPlayEntity, bounds2: IRectangle): boolean {
            let intersection = rectangleIntersection(bounds1, bounds2);
            let result: boolean;
            if (intersection) {
                // check the masks overlap
                let w = ceil(intersection.w);
                let h = ceil(intersection.h);
                intersectionContext.clearRect(0, 0, w, h);
                intersectionContext.drawImage(entity1.renderMask, bounds1.x - intersection.x, bounds1.y - intersection.y);
                intersectionContext.save();
                intersectionContext.globalCompositeOperation = 'destination-in';
                intersectionContext.drawImage(entity2.renderMask, bounds2.x - intersection.x, bounds2.y - intersection.y);
                intersectionContext.restore();

                // look for any non-transparent pixels
                let intersectionData = intersectionContext.getImageData(0, 0, w, h);
                let max = w * h * 4;
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
            var diff = max(1, min(100, now - lastUpdate));
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

        _d.onkeydown = function (e: KeyboardEvent) {
            let input = inputs[e.keyCode];
            if (input) {
                input.unread = true;
                input.a = true;
                input.t = state.ageMillis;
            }
        };

        _d.onkeyup = function (e: KeyboardEvent) {
            let input = inputs[e.keyCode];
            if (input) {
                input.a = false;
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

                let xDiffAbs = abs(xDiff);
                let yDiffAbs = abs(yDiff);

                if (xDiffAbs > minDiff || yDiffAbs > minDiff) {
                    let inputId: InputAtomicId;
                    if (xDiffAbs > yDiffAbs) {
                        if (xDiff > 0) {
                            inputId = INPUT_ATOMIC_ID_RIGHT;
                        } else {
                            inputId = INPUT_ATOMIC_ID_LEFT;
                        }
                    } else {
                        if (yDiff > 0) {
                            inputId = INPUT_ATOMIC_ID_DOWN;
                        } else {
                            inputId = INPUT_ATOMIC_ID_UP;
                        }
                    }
                    let input = inputs[inputId];
                    input.unread = true;
                    input.t = state.ageMillis;

                    xDown = null;
                    yDown = null;
                }
            }
            evt.preventDefault();
        };
        let touchEnd = function (evt: TouchEvent) {
            if (xDown && yDown) {
                // it's a tap
                let input = inputs[INPUT_ATOMIC_ID_ACTION];
                input.unread = true;
                input.t = state.ageMillis;
            }
            evt.preventDefault();
        };

        let click = function (evt: MouseEvent) {
            let input = inputs[INPUT_ATOMIC_ID_ACTION];
            input.unread = true;
            input.t = state.ageMillis;
            evt.preventDefault();
        };

        let eventListeners: { [_: string]: EventListener } = {};
        eventListeners['touchstart'] = touchStart;
        eventListeners['touchmove'] = touchMove;
        eventListeners['touchend'] = touchEnd;
        eventListeners['click'] = click;

        for (let key in eventListeners) {
            _d.addEventListener(key, eventListeners[key]);
        }

        var runner: ILevelPlayStateRunner = {
            animationFrameRequestId: animationFrameRequestId,
            eventListeners: eventListeners
        };

        return {
            t: STATE_LEVEL_PLAY,
            v: runner
        };
    }
}