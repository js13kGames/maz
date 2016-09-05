let EFFECT_ROTATE = 1;
let EFFECT_SCALE = 2;
let EFFECT_TRANSLATE = 3;

type Effect = IEffectRotate | IEffectScale | IEffectTranslate;

let _contextEffectFunctions: { [_: number]: IContextEffectFunction } = {};
_contextEffectFunctions[EFFECT_ROTATE] = contextEffectRotateFunction;
_contextEffectFunctions[EFFECT_SCALE] = contextEffectScaleFunction;
_contextEffectFunctions[EFFECT_TRANSLATE] = contextEffectTranslateFunction;

let recordContextEffectFunction: IRecordContextEffectFunction = recordHandlerDelegateFactory(_contextEffectFunctions);