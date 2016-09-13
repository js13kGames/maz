let animationTurnTweenFactory: IAnimationTweenFactory = function (animation: IAnimationTurn, width: number, height: number) {
    let orientationTransformationFrom = ORIENTATION_TRANSFORMATIONS[animation.orientationFrom];
    let orientationTransformationTo = ORIENTATION_TRANSFORMATIONS[animation.orientationTo];
    let tweens: ITween[] = [];
    if (orientationTransformationFrom.flipY != orientationTransformationTo.flipY) {
        tweens.push({
            durationMillis: animation.durationMillis,
            easing: {
                t: EASING_QUADRATIC_IN_OUT
            },
            effect: {
                t: EFFECT_SCALE,
                v: {
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
    if (orientationTransformationFrom.r != orientationTransformationTo.r && abs(orientationTransformationFrom.r - orientationTransformationTo.r) != 2) {
        let dAngle: number;
        let next = (orientationTransformationFrom.r + 1) % 4 == orientationTransformationTo.r;
        if (next && orientationTransformationFrom.flipY || !next && !orientationTransformationFrom.flipY) {
            dAngle = pi / 2;
        } else {
            dAngle = -pi / 2;
        }
        tweens.push({
            durationMillis: animation.durationMillis,
            easing: {
                t: EASING_LINEAR
            },
            effect: {
                t: EFFECT_ROTATE,
                v: {
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