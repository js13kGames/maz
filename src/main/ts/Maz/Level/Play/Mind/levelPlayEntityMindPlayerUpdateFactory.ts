
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
        let originalOrientation = entity.orientation;
        let direction: Direction;
        let centerMargin = tileCenterFraction * state.tileSize;
        if (mind.desiredDirection == upKeyCode || mind.desiredDirection == downKeyCode) {
            // are we in the margin where we can actually go in the direction we want to ?
            let dx = ((entity.x + entity.width / 2) % state.tileSize) - state.tileSize / 2;
            if (Math.abs(dx) > centerMargin) {
                if (dx > 0) {
                    direction = DIRECTION_WEST;
                } else {
                    direction = DIRECTION_EAST;
                }
            } else {
                if (mind.desiredDirection == upKeyCode) {
                    direction = DIRECTION_NORTH;
                } else /*if (mind.desiredDirection == downKeyCode)*/ {
                    direction = DIRECTION_SOUTH;
                }
            }
        } else if (mind.desiredDirection == leftKeyCode || mind.desiredDirection == rightKeyCode) {
            let dy = ((entity.y + entity.height / 2) % state.tileSize) - state.tileSize / 2;
            if (Math.abs(dy) > centerMargin) {
                if (dy > 0) {
                    direction = DIRECTION_NORTH;
                } else {
                    direction = DIRECTION_SOUTH;
                }
            } else {
                if (mind.desiredDirection == leftKeyCode) {
                    direction = DIRECTION_WEST;
                } else /*if (mind.desiredDirection == rightKeyCode)*/ {
                    direction = DIRECTION_EAST;
                }
            }
        }
        let result: ILevelPlayEntityMindUpdateResult = {
            newAnimations: {}
        };
        if (entity.velocityX || entity.velocityY || directionInput) {
            result.newEntityState = ENTITY_STATE_MOVING;
        } else {
            result.newEntityState = ENTITY_STATE_IDLE;
        }
        if (directionInput) {
            result.newEntities = state.particleFactory(entity.x + entity.width / 2, entity.y + entity.height / 2, entity.description.type.foregroundColor, 4);
        }
        if (direction) {
            result.newDirection = direction;
        }
        let newStateDirection: Direction;
        if (entity.x < -entity.width) {
            newStateDirection = DIRECTION_EAST;
        } else if (entity.x > state.width * state.tileSize) {
            newStateDirection = DIRECTION_WEST;
        } else if (entity.y < -entity.height) {
            newStateDirection = DIRECTION_SOUTH;
        } else if (entity.y > state.height * state.tileSize) {
            newStateDirection = DIRECTION_NORTH;
        }
        if (newStateDirection) {
            let dir = POINT_DIRECTIONS_CARDINAL[newStateDirection - 1];
            state.key.players[0].initialOrientation = entity.orientation;
            result.newState = {
                type: STATE_LEVEL_PLAY,
                value: {
                    universe: state.key.universe,
                    x: state.key.x - dir.x,
                    y: state.key.y - dir.y,
                    z: state.key.z,
                    playerEntryPoint: newStateDirection,
                    players: state.key.players
                }
            };
        } 
        return result;
    }
}