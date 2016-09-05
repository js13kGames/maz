let contextEffectRotateFunction: IContextEffectFunction = function (effect: IEffectRotate, t: number, source: HTMLCanvasElement, destinationCanvas: HTMLCanvasElement, destinationContext: CanvasRenderingContext2D) {
    let cx = effect.cx * destinationCanvas.width;
    let cy = effect.cy * destinationCanvas.height;

    let angle = effect.angleStart + t * effect.dAngle;

    destinationContext.translate(cx, cy);
    destinationContext.rotate(angle);
    destinationContext.drawImage(source, -cx, -cy);
}