let contextEffectRotateFunction: IContextEffectFunction = function (
    effect: IEffectRotate,
    t: number,
    renderer: IRecordContextEffectRenderFunction,
    destinationCanvas: HTMLCanvasElement,
    destinationContext: CanvasRenderingContext2D
) {
    let cx = effect.cx * destinationCanvas.width;
    let cy = effect.cy * destinationCanvas.height;

    let angle = effect.angleStart + t * effect.dAngle;

    destinationContext.translate(cx, cy);
    destinationContext.rotate(angle);
    renderer(destinationContext, -cx, -cy);
}