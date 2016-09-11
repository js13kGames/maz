let animationDieStandardTweenFactory: IAnimationTweenFactory = function (animation: IAnimationHop, width: number, height: number) {
    return [{
        durationMillis: animation.durationMillis/2,
        easing: {
            type: EASING_QUADRATIC_IN
        },
        effect: {
            type: EFFECT_SKEW,
            value: {
                startAngle: 0,
                dAngle: -Math.PI / 2,
                skewX: 1, 
                skewY: 0,
                cx: 0.5,
                cy: 0.5
            }
        }
    }, {
        durationMillis: animation.durationMillis,
        easing: {
            type: EASING_QUADRATIC_OUT
        },
        effect: {
            type: EFFECT_ALPHA,
            value: {
                startAlpha: 1, 
                dAlpha: -1
            }
        }
    }];
}