interface IRecordContextEffectFunction {
    (
        effect: IRecord<Effect>,
        t: number,
        //source: HTMLCanvasElement,
        renderer: IRecordContextEffectRenderFunction,
        destinationCanvas: HTMLCanvasElement,
        destinationContext: CanvasRenderingContext2D
    ): void;
}