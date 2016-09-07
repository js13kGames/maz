function animationTurn(duration: number, orientationFrom: Orientation, orientationTo: Orientation, width: number, height: number): ILevelPlayEntityAnimation {

    let orientationTransformationFrom = ORIENTATION_TRANSFORMATIONS[orientationFrom];
    let orientationTransformationTo = ORIENTATION_TRANSFORMATIONS[orientationTo];
    let tweens: ITween[] = [];
    if (orientationTransformationFrom.flipY != orientationTransformationTo.flipY && Math.abs(orientationTransformationFrom.rotate - orientationTransformationTo.rotate) == 2) {
        tweens.push({
            durationMillis: duration, 
            easing: {
                type: EASING_QUADRATIC_IN_OUT
            },
            effect: {
                type: EFFECT_SCALE, 
                value: {
                    xStart: -1,
                    yStart: 1,
                    dx: 2,
                    dy: 0,
                    cx: 0.5, 
                    cy: 0.5

                }
            }
        });
    } else if (orientationTransformationFrom.rotate != orientationTransformationTo.rotate && orientationTransformationFrom.flipY == orientationTransformationTo.flipY) {
        let dAngle: number;
        let next = (orientationTransformationFrom.rotate + 1) % 4 == orientationTransformationTo.rotate;
        if (next && orientationTransformationFrom.flipY || !next && !orientationTransformationFrom.flipY) {
            dAngle = Math.PI / 2;
        } else {
            dAngle = -Math.PI / 2;
        }
        tweens.push({
            durationMillis: duration,
            easing: {
                type: EASING_LINEAR
            },
            effect: {
                type: EFFECT_ROTATE,
                value: {
                    angleStart: dAngle,
                    dAngle: -dAngle,
                    cx: 0.5,
                    cy: 0.5

                }
            }
        });
    }

    return {
        tweens: tweens
    }
}