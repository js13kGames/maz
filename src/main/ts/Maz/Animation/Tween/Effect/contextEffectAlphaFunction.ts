let contextEffectAlphaFunction: IContextEffectFunction = function (
    effect: IEffectAlpha,
    t: number,
    renderer: IRecordContextEffectRenderFunction,
    destinationCanvas: HTMLCanvasElement,
    destinationContext: CanvasRenderingContext2D
) {
    let alpha = effect.startAlpha + effect.dAlpha * t;
    destinationContext.globalAlpha = alpha;
    renderer(destinationContext, 0, 0);
}