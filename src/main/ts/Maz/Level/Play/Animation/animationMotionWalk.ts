function animationMotionWalk(duration: number, width: number, height: number): ILevelPlayEntityAnimation {
    return {
        tweens: [
            {
                durationMillis: duration,
                easing: {
                    type: EASING_QUADRATIC_IN_OUT,
                    bounce: true
                },
                effect: {
                    type: EFFECT_ROTATE,
                    value: {
                        angleStart: -Math.PI/16, 
                        dAngle: Math.PI/8,
                        cx: 0.5,
                        cy: 1
                    }
                },
                repeat: true
            },
            {
                durationMillis: duration/2,
                easing: {
                    type: EASING_LINEAR,
                    bounce: true
                },
                effect: {
                    type: EFFECT_SCALE,
                    value: {
                        xStart: 0.7,
                        yStart: 1,
                        dx: 0.5,
                        dy: 0,
                        cx: 0.5, 
                        cy: 0.8
                    }
                },
                repeat: true
            },
            {
                durationMillis: duration/2,
                easing: {
                    type: EASING_QUADRATIC_OUT,
                    bounce: true
                },
                effect: {
                    type: EFFECT_TRANSLATE,
                    value: {
                        xStart: 0,
                        yStart: 0.05 * height,
                        dx: 0,
                        dy: -0.1 * height
                    }
                },
                repeat: true
            }
        ]
    }

}