
function levelPlayEntityMindPlayerUpdateFactory(
    tileCenterFraction: number,
    inputs: { [_: number]: IInputAtomic },
    upKeyCode: InputAtomicId,
    downKeyCode: InputAtomicId,
    leftKeyCode: InputAtomicId,
    rightKeyCode: InputAtomicId,
    ...actionKeyCodes: InputAtomicId[]
): ILevelPlayEntityMindUpdateFunction {

    function read(inputId: InputAtomicId): boolean {
        let input = inputs[inputId];
        let result = input.active || input.unread;
        if (result) {
            input.unread = false;
        }
        return result;
    }

    function readLatest(...inputIds: InputAtomicId[]): InputAtomicId {
        var result: InputAtomicId;
        for (let inputId of inputIds) {
            let input = inputs[inputId];
            if (input.unread) {
                input.unread = false;
                result = inputId;
            }
        }
        return result;
    }

    return function (mind: ILevelPlayEntityMindPlayer, state: ILevelPlayState, entity: ILevelPlayEntity): ILevelPlayEntityMindUpdateResult {

        // set the velocity appropriately
        let directionInput = readLatest(upKeyCode, downKeyCode, leftKeyCode, rightKeyCode);
        if (directionInput) {
            mind.desiredDirection = directionInput;
        }
        let vx = entity.velocityX;
        let vy = entity.velocityY;
        let centerMargin = tileCenterFraction * state.tileSize;
        if (mind.desiredDirection == upKeyCode || mind.desiredDirection == downKeyCode) {
            // are we in the margin where we can actually go in the direction we want to ?
            let dx = ((entity.x + entity.width / 2) % state.tileSize) - state.tileSize / 2;
            if (Math.abs(dx) > centerMargin) {
                if (dx > 0) {
                    vx = -entity.description.type.speed;
                } else {
                    vx = entity.description.type.speed;
                }
                vy = 0;
            } else {
                if (mind.desiredDirection == upKeyCode) {
                    vx = 0;
                    vy = -entity.description.type.speed;
                } else /*if (mind.desiredDirection == downKeyCode)*/ {
                    vx = 0;
                    vy = entity.description.type.speed;
                }
            }
        } else if (mind.desiredDirection == leftKeyCode || mind.desiredDirection == rightKeyCode) {
            let dy = ((entity.y + entity.height / 2) % state.tileSize) - state.tileSize / 2;
            if (Math.abs(dy) > centerMargin) {
                if (dy > 0) {
                    vy = -entity.description.type.speed;
                } else {
                    vy = entity.description.type.speed;
                }
                vx = 0;
            } else {
                if (mind.desiredDirection == leftKeyCode) {
                    vx = -entity.description.type.speed;
                    vy = 0;
                } else /*if (mind.desiredDirection == rightKeyCode)*/ {
                    vx = entity.description.type.speed;
                    vy = 0;
                }
            }
        }
        entity.velocityX = vx;
        entity.velocityY = vy;
        let result: ILevelPlayEntityMindUpdateResult = {};
        if (!entity.animations['x']) {
            result.newAnimations = {
                x: animationMotionWalk(800, entity.baseWidth, entity.baseHeight)
            };
        }
        return result;
    }
}