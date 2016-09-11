let EFFECT_ROTATE = 1;
let EFFECT_SCALE = 2;
let EFFECT_TRANSLATE = 3;
let EFFECT_SLIDE_IN = 4;
let EFFECT_SKEW = 5;
let EFFECT_ALPHA = 6;

type Effect = IEffectRotate | IEffectScale | IEffectTranslate | IEffectSlideIn | IEffectSkew | IEffectAlpha;

function effectInit(): IRecordContextEffectFunction {
    let _contextEffectFunctions: { [_: number]: IContextEffectFunction } = {};
    _contextEffectFunctions[EFFECT_ROTATE] = contextEffectRotateFunction;
    _contextEffectFunctions[EFFECT_SCALE] = contextEffectScaleFunction;
    _contextEffectFunctions[EFFECT_TRANSLATE] = contextEffectTranslateFunction;
    _contextEffectFunctions[EFFECT_SLIDE_IN] = contextEffectSlideInFunction;
    _contextEffectFunctions[EFFECT_SKEW] = contextEffectSkewFunction;
    _contextEffectFunctions[EFFECT_ALPHA] = contextEffectAlphaFunction;

    return recordHandlerDelegateFactory(_contextEffectFunctions);
}
