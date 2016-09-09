let contextEffectScaleFunction: IContextEffectFunction = function (
    effect: IEffectScale,
    t: number,
    renderer: IRecordContextEffectRenderFunction,
    destinationCanvas: HTMLCanvasElement,
    destinationContext: CanvasRenderingContext2D
) {

    let cx = effect.cx * destinationCanvas.width;
    let cy = effect.cy * destinationCanvas.height;

    let scaleX = effect.xStart + effect.dx * t;
    let scaleY = effect.yStart + effect.dy * t;

    destinationContext.translate(cx, cy);
    destinationContext.scale(scaleX, scaleY);
    renderer(destinationContext, -cx, -cy);


} 