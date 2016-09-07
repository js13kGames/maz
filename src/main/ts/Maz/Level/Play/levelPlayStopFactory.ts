function levelPlayStopFactory(canvas: HTMLCanvasElement): IStateStopFunction {
    var parent = defaultStateStopFunctionFactory(canvas);
    return function (runner: ILevelPlayStateRunner, nextState: IRecord<StateKey>) {
        window.cancelAnimationFrame(runner.animationFrameRequestId);
        if (nextState.type != STATE_LEVEL_PLAY) {
            // remove flicker by not hiding and showing
            parent(runner, nextState);
        }
        document.onkeydown = null;
        document.onkeyup = null;

        for (let key in runner.eventListeners) {
            document.removeEventListener(key, runner.eventListeners[key]);
        }
    }
}
