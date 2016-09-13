let animationWalkTweenFactory: IAnimationTweenFactory = function (animation: IAnimationWalk, width: number, height: number) {
    return [
        {
            durationMillis: animation.durationMillis,
            easing: {
                t: EASING_QUADRATIC_IN_OUT,
                bounce: true
            },
            effect: {
                t: EFFECT_ROTATE,
                v: {
                    angleStart: -animation.rotateAngle / 2,
                    dAngle: animation.rotateAngle,
                    cx: 0.5,
                    cy: 1
                }
            },
            repeat: true
        },
        {
            durationMillis: animation.durationMillis / 2,
            easing: {
                t: EASING_LINEAR,
                bounce: true
            },
            effect: {
                t: EFFECT_SCALE,
                v: {
                    xStart: 1-animation.scaleX/2,
                    yStart: 1,
                    dx: animation.scaleX,
                    dy: 0,
                    cx: 0.5,
                    cy: 0.8
                }
            },
            repeat: true
        },
        {
            durationMillis: animation.durationMillis / 2,
            easing: {
                t: EASING_QUADRATIC_OUT,
                bounce: true
            },
            effect: {
                t: EFFECT_TRANSLATE,
                v: {
                    xStart: 0,
                    yStart: animation.hopHeightScale * height / 2,
                    dx: 0,
                    dy: -animation.hopHeightScale * height
                }
            },
            repeat: true
        }
    ]
}