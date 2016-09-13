
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
        let result = input.a || input.unread;
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
        let originalOrientation = entity.o;
        let direction: Direction;
        let centerMargin = tileCenterFraction * state.tileSize;
        if (mind.desiredDirection == upKeyCode || mind.desiredDirection == downKeyCode) {
            // are we in the margin where we can actually go in the direction we want to ?
            let dx = ((entity.x + entity.w / 2) % state.tileSize) - state.tileSize / 2;
            if (abs(dx) > centerMargin) {
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
            let dy = ((entity.y + entity.h / 2) % state.tileSize) - state.tileSize / 2;
            if (abs(dy) > centerMargin) {
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
        if (entity.vx || entity.vy || directionInput) {
            result.newEntityState = ENTITY_STATE_MOVING;
        } else {
            result.newEntityState = ENTITY_STATE_IDLE;
        }
        if (direction) {
            result.newDirection = direction;
        }
        let newStateDirection: Direction;
        if (entity.x < -entity.w) {
            newStateDirection = DIRECTION_EAST;
        } else if (entity.x > state.width * state.tileSize) {
            newStateDirection = DIRECTION_WEST;
        } else if (entity.y < -entity.h) {
            newStateDirection = DIRECTION_SOUTH;
        } else if (entity.y > state.height * state.tileSize) {
            newStateDirection = DIRECTION_NORTH;
        }
        if (newStateDirection) {
            let dir = POINT_DIRECTIONS_CARDINAL[newStateDirection - 1];
            state.key.players[0].initialOrientation = entity.o;
            result.newState = {
                t: STATE_LEVEL_PLAY,
                v: {
                    universe: state.key.universe,
                    x: state.key.x - dir.x,
                    y: state.key.y - dir.y,
                    playerEntryPoint: newStateDirection,
                    players: state.key.players
                }
            };
        } 
        return result;
    }
}