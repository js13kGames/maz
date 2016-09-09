let easingQuadraticOutFunction: IEasingFunction = function(easing: EasingQuadraticOut, t: number) {
    return -t * (t - 2);
}