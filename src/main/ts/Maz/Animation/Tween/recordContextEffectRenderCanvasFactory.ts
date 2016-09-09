function recordContextEffectRenderCanvasFactory(canvas: HTMLCanvasElement): IRecordContextEffectRenderFunction {
    return function (context: CanvasRenderingContext2D, x: number, y: number) {
        context.drawImage(canvas, x, y);
    }
}