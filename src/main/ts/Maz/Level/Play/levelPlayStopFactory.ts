function levelPlayStopFactory(canvas: HTMLCanvasElement): IStateStopFunction {
    var parent = defaultStateStopFunctionFactory(canvas);
    return function (runner: ILevelPlayStateRunner, nextState: IRecord<StateKey>) {
        _w.cancelAnimationFrame(runner.animationFrameRequestId);
        if (nextState.t != STATE_LEVEL_PLAY) {
            // remove flicker by not hiding and showing
            parent(runner, nextState);
        }
        /* eh, probably not important
        _d.onkeydown = null;
        _d.onkeyup = null;
        */

        for (let key in runner.eventListeners) {
            _d.removeEventListener(key, runner.eventListeners[key]);
        }
    }
}
