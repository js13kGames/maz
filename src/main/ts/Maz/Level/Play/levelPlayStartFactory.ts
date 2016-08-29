function levelPlayStartFactory(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    entityUpdate: (mind: IRecord<LevelPlayEntityMind>, state: ILevelPlayState, entity: ILevelPlayEntity) => ILevelPlayEntity[],
    inputs: { [_: number]: IInputAtomic },
    maxCollisionSteps: number
): IStateStartFunction {

    function render(state: ILevelPlayState) {
        context.fillStyle = COLOR_BLACK;
        context.fillRect(0, 0, canvas.width, canvas.height);
        for (let entity of state.entities) {
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
            context.drawImage(entity.render, entity.x, entity.y);
        }
    }


    return function (state: ILevelPlayState, nextStateCallback: IStateCompleteCallback): IRecord<ILevelPlayStateRunner> {

        let intersectionCanvas = <HTMLCanvasElement>document.createElement('canvas');
        intersectionCanvas.width = state.tileSize;
        intersectionCanvas.height = state.tileSize;
        let intersectionContext = intersectionCanvas.getContext('2d');

        function update(state: ILevelPlayState, duration: number) {
            let checkEntities: ILevelPlayEntity[] = [];
            for (let i = state.entities.length; i > 0;) {
                i--;
                let entity = state.entities[i];
                let newEntities = entityUpdate(entity.description.mind, state, entity);
                // deal with new entities
                if (newEntities) {
                    for (let newEntity of newEntities) {
                        state.entities.push(newEntity);
                        // NOTE do we need to check the new entity?
                    }
                }

                // deal with dead entities
                if (entity.dead) {
                    state.entities.splice(i, 1);
                } else {
                    entity.updateStartX = entity.x;
                    entity.updateStartY = entity.y;
                    entity.updateDurationOffset = 0;
                    entity.x += (entity.velocityX * duration) / state.tileSize;
                    entity.y += (entity.velocityY * duration) / state.tileSize;

                    checkEntities.push(entity);
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
                    // TODO smarter collision detection (some kind of grid)
                    for (let j = state.entities.length; j > 0;) {
                        j--;
                        let entity = state.entities[j];

                        // do they overlap?
                        if (checkEntity != entity && overlaps(checkEntity, checkEntity, entity, entity)) {
                            // work out when they collided by stepping back 
                            let startTime = Math.max(checkEntity.updateDurationOffset, entity.updateDurationOffset);
                            let endTime = duration;
                            let entityBounds: any = {
                                width: entity.width,
                                height: entity.height
                            };
                            let checkEntityBounds: any = {
                                width: checkEntity.width,
                                height: checkEntity.height
                            };
                            for (let step = 0; step < maxCollisionSteps; step++) {
                                let collisionTime = (endTime + startTime) / 2;

                                entityBounds.x = entity.updateStartX + (entity.velocityX * collisionTime) / state.tileSize;
                                entityBounds.y = entity.updateStartY + (entity.velocityY * collisionTime) / state.tileSize;

                                checkEntityBounds.x = checkEntity.updateStartX + (checkEntity.velocityX * collisionTime) / state.tileSize;
                                checkEntityBounds.y = checkEntity.updateStartY + (checkEntity.velocityY * collisionTime) / state.tileSize;

                                if (overlaps(checkEntity, checkEntityBounds, entity, entityBounds)) {
                                    endTime = collisionTime;
                                } else {
                                    startTime = collisionTime;
                                }
                            }
                            if (!minCollisionEntity || startTime < minCollisionTime) {
                                minCollisionEntity = entity;
                                minCollisionTime = startTime;
                            }
                        }
                    }
                    if (minCollisionEntity) {
                        checkEntity.x = checkEntity.updateStartX + (checkEntity.velocityX * minCollisionTime) / state.tileSize;
                        checkEntity.y = checkEntity.updateStartY + (checkEntity.velocityY * minCollisionTime) / state.tileSize;
                        checkEntity.velocityX = 0;
                        checkEntity.velocityY = 0;


                        minCollisionEntity.x = minCollisionEntity.updateStartX + (minCollisionEntity.velocityX * minCollisionTime) / state.tileSize;
                        minCollisionEntity.y = minCollisionEntity.updateStartY + (minCollisionEntity.velocityY * minCollisionTime) / state.tileSize;
                        minCollisionEntity.velocityX = 0;
                        minCollisionEntity.velocityY = 0;

                        // back out to the min collision time and adjust position (and velocity, and whatever else our 'physics' engine handles
                        if (checkEntity.updateDurationOffset < minCollisionTime) {
                            checkEntity.updateDurationOffset = minCollisionTime;
                            newCheckEntities.push(checkEntity);
                        }
                        if (minCollisionEntity.updateDurationOffset < minCollisionTime) {
                            minCollisionEntity.updateDurationOffset = minCollisionTime;
                            // TODO this might be getting added multiple times!
                            newCheckEntities.push(minCollisionEntity);
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

            var diff = Math.min(100, now - lastUpdate);
            lastUpdate = now;
            update(state, diff);

            render(state);

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