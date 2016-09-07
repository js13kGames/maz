
let ORIENTATION_FACING_LEFT_FEET_UP: Orientation = 1;
let ORIENTATION_FACING_LEFT_FEET_DOWN: Orientation = 2;
let ORIENTATION_FACING_RIGHT_FEET_UP: Orientation = 3;
let ORIENTATION_FACING_RIGHT_FEET_DOWN: Orientation = 4;
let ORIENTATION_FACING_UP_FEET_RIGHT: Orientation = 5;
let ORIENTATION_FACING_UP_FEET_LEFT: Orientation = 6;
let ORIENTATION_FACING_DOWN_FEET_RIGHT: Orientation = 7;
let ORIENTATION_FACING_DOWN_FEET_LEFT: Orientation = 8;

type Orientation = number;

interface IOrientationTransformation {
    flipY?: boolean;
    rotate: number;
    next: { [_: number]: Orientation };
}

function initOrientationTransformations(): { [_: number]: IOrientationTransformation } {
    let orientationTransformations: { [_: number]: IOrientationTransformation } = {};
    orientationTransformations[ORIENTATION_FACING_LEFT_FEET_UP] = {
        rotate: 2,
        next: orientationCreateTargets(
            ORIENTATION_FACING_UP_FEET_RIGHT,
            ORIENTATION_FACING_DOWN_FEET_LEFT,
            ORIENTATION_FACING_LEFT_FEET_UP,
            ORIENTATION_FACING_RIGHT_FEET_UP
        )
    };
    orientationTransformations[ORIENTATION_FACING_LEFT_FEET_DOWN] = {
        flipY: true,
        rotate: 2,
        next: orientationCreateTargets(
            ORIENTATION_FACING_UP_FEET_LEFT,
            ORIENTATION_FACING_DOWN_FEET_RIGHT,
            ORIENTATION_FACING_LEFT_FEET_DOWN,
            ORIENTATION_FACING_RIGHT_FEET_DOWN
        )
    };
    orientationTransformations[ORIENTATION_FACING_RIGHT_FEET_UP] = {
        flipY: true,
        rotate: 0,
        next: orientationCreateTargets(
            ORIENTATION_FACING_UP_FEET_LEFT,
            ORIENTATION_FACING_DOWN_FEET_RIGHT,
            ORIENTATION_FACING_LEFT_FEET_UP,
            ORIENTATION_FACING_RIGHT_FEET_UP
        )
    };
    orientationTransformations[ORIENTATION_FACING_RIGHT_FEET_DOWN] = {
        rotate: 0,
        next: orientationCreateTargets(
            ORIENTATION_FACING_UP_FEET_RIGHT,
            ORIENTATION_FACING_DOWN_FEET_LEFT,
            ORIENTATION_FACING_LEFT_FEET_DOWN,
            ORIENTATION_FACING_RIGHT_FEET_DOWN
        )
    };
    orientationTransformations[ORIENTATION_FACING_UP_FEET_RIGHT] = {
        rotate: 3,
        next: orientationCreateTargets(
            ORIENTATION_FACING_UP_FEET_RIGHT,
            ORIENTATION_FACING_DOWN_FEET_RIGHT,
            ORIENTATION_FACING_LEFT_FEET_DOWN,
            ORIENTATION_FACING_RIGHT_FEET_DOWN
        )
    };
    orientationTransformations[ORIENTATION_FACING_UP_FEET_LEFT] = {
        flipY: true,
        rotate: 3,
        next: orientationCreateTargets(
            ORIENTATION_FACING_UP_FEET_LEFT,
            ORIENTATION_FACING_DOWN_FEET_LEFT,
            ORIENTATION_FACING_LEFT_FEET_DOWN,
            ORIENTATION_FACING_RIGHT_FEET_DOWN
        )
    };
    orientationTransformations[ORIENTATION_FACING_DOWN_FEET_RIGHT] = {
        flipY: true,
        rotate: 1,
        next: orientationCreateTargets(
            ORIENTATION_FACING_UP_FEET_RIGHT,
            ORIENTATION_FACING_DOWN_FEET_RIGHT,
            ORIENTATION_FACING_LEFT_FEET_DOWN,
            ORIENTATION_FACING_RIGHT_FEET_DOWN
        )
    };
    orientationTransformations[ORIENTATION_FACING_DOWN_FEET_LEFT] = {
        rotate: 1,
        next: orientationCreateTargets(
            ORIENTATION_FACING_UP_FEET_LEFT,
            ORIENTATION_FACING_DOWN_FEET_LEFT,
            ORIENTATION_FACING_LEFT_FEET_DOWN,
            ORIENTATION_FACING_RIGHT_FEET_DOWN
        )
    };
    return orientationTransformations;
}


function orientationCreateTargets(upOrientation: Orientation, downOrientation: Orientation, leftOrientation: Orientation, rightOrientation: Orientation): { [_: number]: Orientation } {
    let result: { [_: number]: Orientation } = {};
    result[DIRECTION_NORTH] = upOrientation;
    result[DIRECTION_SOUTH] = downOrientation;
    result[DIRECTION_WEST] = leftOrientation;
    result[DIRECTION_EAST] = rightOrientation;
    return result;
}

