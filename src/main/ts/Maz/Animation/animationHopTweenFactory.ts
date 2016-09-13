let animationHopTweenFactory: IAnimationTweenFactory = function (animation: IAnimationHop, width: number, height: number) {

    return [
        {
            durationMillis: animation.durationMillis,
            easing: {
                t: EASING_QUADRATIC_IN_OUT
            },
            effect: {
                t: EFFECT_SCALE,
                v: {
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
    ];
}