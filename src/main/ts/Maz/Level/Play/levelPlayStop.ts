function levelPlayStopFactory(canvas: HTMLCanvasElement): IStateStopFunction {
    var parent = defaultStateStopFunctionFactory(canvas);
    return function (runner: ILevelPlayStateRunner) {
        window.cancelAnimationFrame(runner.animationFrameRequestId);
        parent(runner);
    }
}
