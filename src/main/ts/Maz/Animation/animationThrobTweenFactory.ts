let animationThrobTweenFactory: IAnimationTweenFactory = function(animation: IAnimationThrob, width: number, height: number) {
    return [
        {
            durationMillis: animation.durationMillis,
            easing: {
                t: EASING_QUADRATIC_IN_OUT,
                bounce: true
            },
            effect: {
                t: EFFECT_SCALE,
                v: {
                    xStart: 1 - animation.scaleX / 2,
                    yStart: 1 - animation.scaleY / 2,
                    dx: animation.scaleX,
                    dy: animation.scaleY,
                    cx: 0.5,
                    cy: 0.8
                }
            },
            repeat: true
        }
    ];
}