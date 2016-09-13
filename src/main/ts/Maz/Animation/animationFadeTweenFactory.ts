let animationFadeTweenFactory: IAnimationTweenFactory = function (animation: IAnimationAlpha, width: number, height: number) {
    return [{
        durationMillis: animation.durationMillis,
        easing: {
            t: EASING_QUADRATIC_OUT
        },
        effect: {
            t: EFFECT_ALPHA, 
            v: {
                startAlpha: animation.startAlpha,
                dAlpha: animation.dAlpha                
            }
        }
    }]

}