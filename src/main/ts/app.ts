let ORIENTATION_TRANSFORMATIONS: { [_: number]: IOrientationTransformation };

window.onload = function () {

    ORIENTATION_TRANSFORMATIONS = initOrientationTransformations();

    let minTiles = 250;
    let tileMargin = 0.05;

    let collisionHandlerSearch = collisionHandlerSearchFactory(entityTypeFilterInit());

    let matrixPopulators: { [_: number]: ILevelPlayMatrixPopulator[] } = {};

    let wallEntityType: IEntityType = {
        backgroundColor: '#AA9',
        bold: true,
        character: 'x',
        classification: CLASSIFICATION_WALL,
        foregroundColor: '#998',
        speed: 0,
        observationTimeoutMillis: 10000,
        minDecisionTimeoutMillis: 500,
        varianceDecisionTimeoutMillis: 100,
        children: [],
        collisionHandlers: [],
        animations: {}

    };

    matrixPopulators[CLASSIFICATION_WALL] = [
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0, false)), wallEntityType),
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0, true)), wallEntityType),
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0.2, false)), wallEntityType),
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0.5, true)), wallEntityType),
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, true, 0, false)), wallEntityType),
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, true, 0, true)), wallEntityType)
    ];

    function monsterFilterFactory(padding: number) {
        return function (entityDescriptions: ILevelPlayEntityDescription[], matrix: ILevelPlayMatrix<ILevelPlayEntityDescription[]>, x: number, y: number) {
            if (x < padding || x >= matrix.width - padding || y < padding || y >= matrix.height - padding) {
                return false;
            } else {
                for (let entityDescription of entityDescriptions) {
                    if (entityDescription.type.classification == CLASSIFICATION_WALL || entityDescription.type.classification == CLASSIFICATION_OBSTACLE) {
                        return false;
                    }
                }
            }
            return true;
        };
    }

    matrixPopulators[CLASSIFICATION_MONSTER] = [
        levelPlayMatrixPopulatorFloodFillFactory(2, 6, 1, 1, 0, 40, monsterFilterFactory(2))
    ];
    matrixPopulators[CLASSIFICATION_COLLECTABLE_COMMON] = [
        levelPlayMatrixPopulatorFloodFillFactory(1, 1, 0, minTiles, 0, 20, monsterFilterFactory(1))
    ]

    var playerInputs: { [_: number]: IInputAtomic } = {};
    playerInputs[INPUT_ATOMIC_ID_UP] = {};
    playerInputs[INPUT_ATOMIC_ID_DOWN] = {};
    playerInputs[INPUT_ATOMIC_ID_LEFT] = {};
    playerInputs[INPUT_ATOMIC_ID_RIGHT] = {};
    playerInputs[INPUT_ATOMIC_ID_ACTION] = {};

    var levelPlayMindUpdateHandlers: { [_: number]: ILevelPlayEntityMindUpdateFunction } = {};
    levelPlayMindUpdateHandlers[MIND_PLAYER_1] = levelPlayEntityMindPlayerUpdateFactory(
        tileMargin,
        playerInputs,
        INPUT_ATOMIC_ID_UP,
        INPUT_ATOMIC_ID_DOWN,
        INPUT_ATOMIC_ID_LEFT,
        INPUT_ATOMIC_ID_RIGHT
    );
    levelPlayMindUpdateHandlers[MIND_MONSTER] = levelPlayEntityMindMonsterUpdateFactory(
        tileMargin,
        collisionHandlerSearch,
        costRecordCollisionResolutionValueFunctionFactory(),
        desirabilityCollisionResolutionValueFunctionFactory(),
        inverseDesirabilityCollisionResolutionValueFunctionFactory()
    );
    // do nothing
    levelPlayMindUpdateHandlers[MIND_INERT] = <any>function () { };

    var levelPlayMindHandler = recordHandlerDelegateFactory(levelPlayMindUpdateHandlers);

    var contentElement = document.body;

    var introElement = document.getElementById('i');
    var introPlayButton = document.getElementById('ip');
    var introRestartButton = document.getElementById('r');

    var levelPlayElement = <HTMLCanvasElement>document.getElementById('p');
    var levelPlayContext = levelPlayElement.getContext('2d');

    let classificationRanges: { [_: number]: IRange } = {};
    classificationRanges[CLASSIFICATION_MONSTER] = {
        min: 1,
        max: 3
    };
    classificationRanges[CLASSIFICATION_COLLECTABLE_COMMON] = {
        min: 1, 
        max: 1
    };
    classificationRanges[CLASSIFICATION_COLLECTABLE_RARE] = {
        min: 0,
        max: 2
    };
    classificationRanges[CLASSIFICATION_OBSTACLE] = {
        min: 0,
        max: 1
    };
    classificationRanges[CLASSIFICATION_WALL] = {
        min: 1,
        max: 3
    };

    var initHandlers: { [_: number]: IRecordHandlerFunction<StateKey, IRecord<State>> } = {};
    initHandlers[STATE_INTRO] = introInit;
    initHandlers[STATE_LEVEL_PLAY] = levelPlayInitFactory(
        tileMargin * 4, 
        matrixPopulators,
        contentElement,
        levelPlayElement,
        levelPlayContext,
        minTiles,
        7,
        classificationRanges
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
        5,
        easingInit(), 
        effectInit(),
        animationInit(),
        collisionHandlerSearch,
        4000
    );
    var startHandler = recordHandlerDelegateFactory(startHandlers);

    var stopHandlers: { [_: number]: IRecordHandlerFunction<StateRunner, void> } = {};
    stopHandlers[STATE_INTRO] = defaultStateStopFunctionFactory(introElement);
    stopHandlers[STATE_LEVEL_PLAY] = levelPlayStopFactory(levelPlayElement);
    var stopHandler = recordHandlerDelegateFactory(stopHandlers);

    var callback: IStateCompleteCallback = function (nextStateKey: IRecord<StateKey>) {
        if (currentStateRunner) {
            stopHandler(currentStateRunner, nextStateKey);
        }
        currentStateKey = nextStateKey;
        currentState = initHandler(nextStateKey);
        currentStateRunner = startHandler(currentState, callback);
        return true;
    };
    var currentStateKey: IRecord<StateKey> = {
        type: STATE_INTRO
    };
    var currentState = initHandler(currentStateKey);
    var currentStateRunner = startHandler(currentState, callback);

    window.onresize = function () {
        stopHandler(currentStateRunner, currentStateKey);
        if (currentStateKey.type == STATE_LEVEL_PLAY) {
            // disable scrolling in
            let stateKeyLevelPlay = <ILevelPlayStateKey>currentStateKey.value;
            stateKeyLevelPlay.suppressScroll = true;
        }
        currentState = initHandler(currentStateKey);
        currentStateRunner = startHandler(currentState, callback);
    };
};