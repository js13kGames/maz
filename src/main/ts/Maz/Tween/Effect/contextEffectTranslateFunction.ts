let contextEffectTranslateFunction: IContextEffectFunction = function (
    effect: IEffectTranslate,
    t: number,
    renderer: IRecordContextEffectRenderFunction,
    destinationCanvas: HTMLCanvasElement,
    destinationContext: CanvasRenderingContext2D
) {

    let dx = effect.xStart + t * effect.dx;
    let dy = effect.yStart + t * effect.dy;

    renderer(destinationContext, dx, dy);
}