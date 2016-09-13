let animationDieStandardTweenFactory: IAnimationTweenFactory = function (animation: IAnimationHop, width: number, height: number) {
    return [{
        durationMillis: animation.durationMillis/2,
        easing: {
            t: EASING_QUADRATIC_IN
        },
        effect: {
            t: EFFECT_SKEW,
            v: {
                startAngle: 0,
                dAngle: -pi / 2,
                skewX: 1, 
                skewY: 0,
                cx: 0.5,
                cy: 0.5
            }
        }
    }, {
        durationMillis: animation.durationMillis,
        easing: {
            t: EASING_QUADRATIC_OUT
        },
        effect: {
            t: EFFECT_ALPHA,
            v: {
                startAlpha: 1, 
                dAlpha: -1
            }
        }
    }];
}