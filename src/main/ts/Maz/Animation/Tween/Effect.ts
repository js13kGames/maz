let EFFECT_ROTATE = 1;
let EFFECT_SCALE = 2;
let EFFECT_TRANSLATE = 3;
let EFFECT_SLIDE_IN = 4;

type Effect = IEffectRotate | IEffectScale | IEffectTranslate | IEffectSlideIn;

function effectInit(): IRecordContextEffectFunction {
    let _contextEffectFunctions: { [_: number]: IContextEffectFunction } = {};
    _contextEffectFunctions[EFFECT_ROTATE] = contextEffectRotateFunction;
    _contextEffectFunctions[EFFECT_SCALE] = contextEffectScaleFunction;
    _contextEffectFunctions[EFFECT_TRANSLATE] = contextEffectTranslateFunction;
    _contextEffectFunctions[EFFECT_SLIDE_IN] = contextEffectSlideInFunction;

    return recordHandlerDelegateFactory(_contextEffectFunctions);
}
