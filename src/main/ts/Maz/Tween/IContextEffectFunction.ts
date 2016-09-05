interface IContextEffectFunction {
    (effect: Effect, t: number, source: HTMLCanvasElement, destinationCanvas: HTMLCanvasElement, destinationContext: CanvasRenderingContext2D): void;
}