let animationHopTweenFactory: IAnimationTweenFactory = function (animation: IAnimationHop, width: number, height: number) {

    return [
        {
            durationMillis: animation.durationMillis,
            easing: {
                type: EASING_QUADRATIC_IN_OUT
            },
            effect: {
                type: EFFECT_SCALE,
                value: {
                    xStart: 1 - animation.squishXScale / 2,
                    yStart: 1 - animation.squishYScale / 2,
                    dx: animation.squishXScale,
                    dy: animation.squishYScale,
                    cx: 0.5,
                    cy: 0.8
                }
            },
            repeat: true
        },
        {
            durationMillis: animation.durationMillis,
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
    ];
}