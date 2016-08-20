window.onload = function() {
    var startHandlers: { [_: number]: IRecordHandlerFunction<StateKey, void> } = {};
    startHandlers[STATE_KEY_INTRO] = introStart;
    //startHandlers[STATE_KEY_LEVEL] = L.levelStart;
    var startHandler = recordHandlerDelegateFactory(startHandlers);

    var stopHandlers: { [_: number]: IRecordHandlerFunction<State, void> } = {};
    stopHandlers[STATE_INTRO] = introStop;
    var stopHandler = recordHandlerDelegateFactory(stopHandlers);

    var e = document.getElementById('content');
    var currentState;
    var callback: IStateCompleteCallback = function (nextState: IRecord<StateKey>) {
        if (currentState) {
            stopHandler(currentState, e);
        }
        currentState = startHandler(nextState, e, callback);
    };
    introStart(null, e, callback);
};