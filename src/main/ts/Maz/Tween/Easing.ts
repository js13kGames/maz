let EASING_LINEAR = 1;
let EASING_QUADRATIC_IN = 2;
let EASING_QUADRATIC_OUT = 3;
let EASING_QUADRATIC_IN_OUT = 4;

type Easing = EasingLinear | EasingQuadraticIn | EasingQuadraticOut | EasingQuadraticInOut;

let _easingFunctions: { [_: number]: IEasingFunction } = {};
_easingFunctions[EASING_LINEAR] = easingLinearFunction;
_easingFunctions[EASING_QUADRATIC_IN] = easingQuadraticInFunction;
_easingFunctions[EASING_QUADRATIC_OUT] = easingQuadraticOutFunction;
_easingFunctions[EASING_QUADRATIC_IN_OUT] = easingQuadraticInOutFunction;

let recordEasingFunction: IRecordEasingFunction = recordHandlerDelegateFactory(_easingFunctions);