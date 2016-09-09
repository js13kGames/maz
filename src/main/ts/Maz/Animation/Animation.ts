type AnimationType = number;

let ANIMATION_TYPE_HOP: AnimationType = 1;
let ANIMATION_TYPE_WALK: AnimationType = 2;
let ANIMATION_TYPE_THROB: AnimationType = 3;
let ANIMATION_TYPE_FLAP: AnimationType = 4;
let ANIMATION_TYPE_TURN: AnimationType = 5;

type Animation = IAnimationHop | IAnimationWalk | IAnimationThrob | IAnimationTurn;

function animationInit(): IRecordAnimationTweenFactory {
    let _animationTweenFactories: { [_: number]: IAnimationTweenFactory } = {};

    _animationTweenFactories[ANIMATION_TYPE_HOP] = animationHopTweenFactory;
    _animationTweenFactories[ANIMATION_TYPE_WALK] = animationWalkTweenFactory;
    _animationTweenFactories[ANIMATION_TYPE_THROB] = animationThrobTweenFactory; 
    // animation turn not supported from record

    return recordHandlerDelegateFactory(_animationTweenFactories);
}
