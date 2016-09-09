let animationTurnTweenFactory: IAnimationTweenFactory = function (animation: IAnimationTurn, width: number, height: number) {
    let orientationTransformationFrom = ORIENTATION_TRANSFORMATIONS[animation.orientationFrom];
    let orientationTransformationTo = ORIENTATION_TRANSFORMATIONS[animation.orientationTo];
    let tweens: ITween[] = [];
    if (orientationTransformationFrom.flipY != orientationTransformationTo.flipY) {
        tweens.push({
            durationMillis: animation.durationMillis,
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
    }
    if (orientationTransformationFrom.rotate != orientationTransformationTo.rotate && Math.abs(orientationTransformationFrom.rotate - orientationTransformationTo.rotate) != 2) {
        let dAngle: number;
        let next = (orientationTransformationFrom.rotate + 1) % 4 == orientationTransformationTo.rotate;
        if (next && orientationTransformationFrom.flipY || !next && !orientationTransformationFrom.flipY) {
            dAngle = Math.PI / 2;
        } else {
            dAngle = -Math.PI / 2;
        }
        tweens.push({
            durationMillis: animation.durationMillis,
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

    return tweens;

}