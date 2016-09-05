function animationMotionWalk(duration: number, width: number, height: number): ILevelPlayEntityAnimation {
    return {
        tweens: [
            {
                durationMillis: duration,
                easing: {
                    type: EASING_QUADRATIC_IN_OUT
                },
                effect: {
                    type: EFFECT_ROTATE,
                    value: {
                        angleStart: -Math.PI/8, 
                        dAngle: Math.PI/4,
                        cx: 0.5,
                        cy: 1
                    }
                },
                repeat: true
            },
        /*
            {
                durationMillis: duration,
                easing: {
                    type: EASING_LINEAR
                },
                effect: {
                    type: EFFECT_SCALE,
                    value: {
                        xStart: 1.2,
                        yStart: 1,
                        dx: -0.4,
                        dy: 0,
                        cx: 0.5, 
                        cy: 0.8
                    }
                },
                repeat: true
            }
            */
        ]
    }

}