
function levelPlayEntityMindPlayerUpdateFactory(
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

    return function (mind: ILevelPlayEntityMindPlayer, state: ILevelPlayState, entity: ILevelPlayEntity): ILevelPlayEntity[] {

        // set the velocity appropriately
        let directionInput = readLatest(upKeyCode, downKeyCode, leftKeyCode, rightKeyCode);
        if (directionInput) {
            mind.desiredDirection = directionInput;
        }
        let vx = entity.velocityX;
        let vy = entity.velocityY;
        if (mind.desiredDirection == upKeyCode) {
            vx = 0;
            vy = -entity.description.type.speed;
        } else if (mind.desiredDirection == downKeyCode) {
            vx = 0;
            vy = entity.description.type.speed;
        } else if (mind.desiredDirection == leftKeyCode) {
            vx = -entity.description.type.speed;
            vy = 0;
        } else if (mind.desiredDirection == rightKeyCode) {
            vx = entity.description.type.speed;
            vy = 0;
        }
        entity.velocityX = vx;
        entity.velocityY = vy;
        return null;
    }
}