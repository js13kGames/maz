let animationWalkTweenFactory: IAnimationTweenFactory = function (animation: IAnimationWalk, width: number, height: number) {
    return [
        {
            durationMillis: animation.durationMillis,
            easing: {
                type: EASING_QUADRATIC_IN_OUT,
                bounce: true
            },
            effect: {
                type: EFFECT_ROTATE,
                value: {
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
                type: EASING_LINEAR,
                bounce: true
            },
            effect: {
                type: EFFECT_SCALE,
                value: {
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
                type: EASING_QUADRATIC_OUT,
                bounce: true
            },
            effect: {
                type: EFFECT_TRANSLATE,
                value: {
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