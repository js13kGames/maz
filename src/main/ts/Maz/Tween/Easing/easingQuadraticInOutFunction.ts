let easingQuadraticInOutFunction: IEasingFunction = function (easing: EasingQuadraticInOut, t: number) {
    t *= 2;
    if (t < 1) {
        return (t * t)/2;
    } else {
        t--;
        return (t * (t - 2) - 1)/-2;
        
    }
}