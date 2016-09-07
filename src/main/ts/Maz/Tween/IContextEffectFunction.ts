interface IContextEffectFunction {
    (
        effect: Effect,
        t: number,
        renderer: IRecordContextEffectRenderFunction,
        destinationCanvas: HTMLCanvasElement,
        destinationContext: CanvasRenderingContext2D
    ): void;
}