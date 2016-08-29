window.onload = function () {

    var minTiles = 348;

    var matrixPopulators: { [_: number]: ILevelPlayMatrixPopulator[] } = {};
    matrixPopulators[CLASSIFICATION_WALL] = [
        levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0, false)),
        levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0, true)),
        levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0.2, false)),
        levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0.5, true)),
        levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, true, 0, false)),
        levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, true, 0, true))
    ];

    var playerInputs: { [_: number]: IInputAtomic } = {};
    playerInputs[INPUT_ATOMIC_ID_UP] = {};
    playerInputs[INPUT_ATOMIC_ID_DOWN] = {};
    playerInputs[INPUT_ATOMIC_ID_LEFT] = {};
    playerInputs[INPUT_ATOMIC_ID_RIGHT] = {};

    var levelPlayMindUpdateHandlers: { [_: number]: ILevelPlayEntityMindUpdateFunction } = {};
    levelPlayMindUpdateHandlers[MIND_PLAYER_1] = levelPlayEntityMindPlayerUpdateFactory(
        playerInputs,
        INPUT_ATOMIC_ID_UP,
        INPUT_ATOMIC_ID_DOWN,
        INPUT_ATOMIC_ID_LEFT,
        INPUT_ATOMIC_ID_RIGHT
    );
    levelPlayMindUpdateHandlers[MIND_MONSTER] = levelPlayEntityMindMonsterUpdateFactory();

    var levelPlayMindHandler = recordHandlerDelegateFactory(levelPlayMindUpdateHandlers);

    var contentElement = document.body;

    var introElement = document.getElementById('intro');
    var introPlayButton = document.getElementById('intro_play_button');
    var introRestartButton = document.getElementById('intro_restart_button');

    var levelPlayElement = <HTMLCanvasElement>document.getElementById('level_play');
    var levelPlayContext = levelPlayElement.getContext('2d');

    var initHandlers: { [_: number]: IRecordHandlerFunction<StateKey, IRecord<State>> } = {};
    initHandlers[STATE_INTRO] = introInit;
    initHandlers[STATE_LEVEL_PLAY] = levelPlayInitFactory(
        matrixPopulators,
        contentElement,
        levelPlayElement,
        levelPlayContext,
        minTiles,
        7
    );
    var initHandler = recordHandlerDelegateFactory(initHandlers);

    var startHandlers: { [_: number]: IRecordHandlerFunction<State, IRecord<StateRunner>> } = {};
    var introStart = introStartFactory(introElement, introPlayButton, introRestartButton);
    startHandlers[STATE_INTRO] = introStart;
    startHandlers[STATE_LEVEL_PLAY] = levelPlayStartFactory(
        levelPlayElement,
        levelPlayContext,
        levelPlayMindHandler,
        playerInputs,
        5
    );
    var startHandler = recordHandlerDelegateFactory(startHandlers);

    var stopHandlers: { [_: number]: IRecordHandlerFunction<StateRunner, void> } = {};
    stopHandlers[STATE_INTRO] = defaultStateStopFunctionFactory(introElement);
    stopHandlers[STATE_LEVEL_PLAY] = levelPlayStopFactory(levelPlayElement);
    var stopHandler = recordHandlerDelegateFactory(stopHandlers);

    var callback: IStateCompleteCallback = function (nextStateKey: IRecord<StateKey>) {
        if (currentStateRunner) {
            stopHandler(currentStateRunner);
        }
        currentStateKey = nextStateKey;
        currentState = initHandler(nextStateKey);
        currentStateRunner = startHandler(currentState, callback);
    };
    var currentStateKey = null;
    var currentState = introInit(currentStateKey);
    var currentStateRunner = introStart(currentState, callback);
};