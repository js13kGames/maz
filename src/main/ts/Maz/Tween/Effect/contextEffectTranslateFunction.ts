let contextEffectTranslateFunction: IContextEffectFunction = function (effect: IEffectTranslate, t: number, source: HTMLCanvasElement, destinationCanvas: HTMLCanvasElement, destinationContext: CanvasRenderingContext2D) {

    let dx = effect.xStart + t * effect.dx;
    let dy = effect.yStart + t * effect.dy;

    destinationContext.drawImage(source, dx, dy);

}