function animationMotionHop(duration: number, width: number, height: number): ILevelPlayEntityAnimation {
    return {
        tweens: [
            {
                durationMillis: duration,
                easing: {
                    type: EASING_QUADRATIC_IN_OUT
                },
                effect: {
                    type: EFFECT_SCALE,
                    value: {
                        xStart: 1.15,
                        yStart: 0.8,
                        dx: -0.3,
                        dy: 0.2,
                        cx: 0.5,
                        cy: 1
                    }
                },
                repeat: true
            },
            {
                durationMillis: duration,
                easing: {
                    type: EASING_QUADRATIC_OUT,
                    bounce: true
                },
                effect: {
                    type: EFFECT_TRANSLATE,
                    value: {
                        xStart: 0,
                        yStart: 0,
                        dx: 0,
                        dy: -0.3 * height
                    }
                },
                repeat: true
            }
        ]
    }
}