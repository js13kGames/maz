let animationFadeTweenFactory: IAnimationTweenFactory = function (animation: IAnimationAlpha, width: number, height: number) {
    return [{
        durationMillis: animation.durationMillis,
        easing: {
            type: EASING_QUADRATIC_OUT
        },
        effect: {
            type: EFFECT_ALPHA, 
            value: {
                startAlpha: animation.startAlpha,
                dAlpha: animation.dAlpha                
            }
        }
    }]

}