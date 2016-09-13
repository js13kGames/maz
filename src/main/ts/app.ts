let ORIENTATION_TRANSFORMATIONS: { [_: number]: IOrientationTransformation };

let _w = window;
let _d = document;
let _c = 'class';

_w.onload = function () {

    var audioContext: AudioContext;
    if (_w["AudioContext"]) {
        audioContext = new AudioContext();
        //    } else if (_w["webkitAudioContext"]) {
        //        audioContext = new webkitAudioContext();
    }

    ORIENTATION_TRANSFORMATIONS = initOrientationTransformations();

    let minTiles = 250;
    let tileMargin = 0.05;
    let entityTypeBits = 3;

    let collisionHandlerSearch = collisionHandlerSearchFactory(levelPlayEntityFilterInit());

    let matrixPopulators: { [_: number]: ILevelPlayMatrixPopulator[] } = {};

    let wallEntityType: IEntityType = {
        bg: '#AA9',
        bold: true,
        character: 'x',
        classification: CLASSIFICATION_WALL,
        fg: ['#998'],
        sp: 0,
        observationTimeoutMillis: 10000,
        minDecisionTimeoutMillis: 500,
        varianceDecisionTimeoutMillis: 100,
        collisionHandlers: [],
        animations: {}
    };

    let particleAnimations: { [_: number]: IRecord<Animation> } = {};
    particleAnimations[ENTITY_STATE_DYING] = {
        t: ANIMATION_TYPE_FADE,
        v: {
            durationMillis: 999,
            startAlpha: 1,
            dAlpha: -1
        }
    };
    let particleEntityType: IEntityType = {
        character: '?',
        classification: CLASSIFICATION_PARTICLE,
        fg: [], 
        sp: 0.03,
        observationTimeoutMillis: 10000,
        minDecisionTimeoutMillis: 300,
        varianceDecisionTimeoutMillis: 100,
        collisionHandlers: [], 
        animations: particleAnimations 
    };

    matrixPopulators[CLASSIFICATION_WALL] = [
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0, false, SIDE_NEUTRAL)), wallEntityType),
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0, true, SIDE_NEUTRAL)), wallEntityType),
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0.2, false, SIDE_NEUTRAL)), wallEntityType),
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, false, 0.5, true, SIDE_NEUTRAL)), wallEntityType),
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, true, 0, false, SIDE_NEUTRAL)), wallEntityType),
        levelPlayMatrixPopulatorBoundaryProxyFactory(levelPlayMatrixPopulatorFillerProxyFactory(levelPlayMatrixPopulatorRectangleFactory(minTiles, true, 0, true, SIDE_NEUTRAL)), wallEntityType)
    ];

    function monsterFilterFactory(padding: number) {
        return function (entityDescriptions: ILevelPlayEntityDescription[], matrix: ILevelPlayMatrix<ILevelPlayEntityDescription[]>, x: number, y: number) {
            if (x < padding || x >= matrix.width - padding || y < padding || y >= matrix.height - padding) {
                return false;
            } else {
                for (let entityDescription of entityDescriptions) {
                    if (entityDescription.t.classification == CLASSIFICATION_WALL || entityDescription.t.classification == CLASSIFICATION_OBSTACLE) {
                        return false;
                    }
                }
            }
            return true;
        };
    }

    matrixPopulators[CLASSIFICATION_MONSTER] = [
        levelPlayMatrixPopulatorFloodFillFactory(2, 6, 1, 1, 0, 40, monsterFilterFactory(2), SIDE_MONSTER, CLASSIFICATION_MONSTER)
    ];
    matrixPopulators[CLASSIFICATION_COLLECTABLE_COMMON] = [
        levelPlayMatrixPopulatorFloodFillFactory(1, 1, 0, minTiles, 0, 20, monsterFilterFactory(1), SIDE_COLLECT, CLASSIFICATION_COLLECTABLE_COMMON)
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
    levelPlayMindUpdateHandlers[MIND_PARTICLE] = levelPlayEntityMindParticleUpdateFactory();
    // do nothing
    levelPlayMindUpdateHandlers[MIND_INERT] = <any>function () { };

    var levelPlayMindHandler = recordHandlerDelegateFactory(levelPlayMindUpdateHandlers);

    var contentElement = _d.body;

    var introElement = _d.getElementById('i');
    var introPlayButton = _d.getElementById('v');
    var introRestartButton = _d.getElementById('w');

    var levelPlayElement = <HTMLCanvasElement>_d.getElementById('p');
    var levelPlayContext = getContext(levelPlayElement);

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

    let animationFactory = animationInit();

    var initHandlers: { [_: number]: IRecordHandlerFunction<StateKey, IRecord<State>> } = {};
    initHandlers[STATE_INTRO] = introInit;
    initHandlers[STATE_LEVEL_PLAY] = levelPlayInitFactory(
        tileMargin * 4,
        entityTypeBits,
        matrixPopulators,
        contentElement,
        levelPlayElement,
        levelPlayContext,
        minTiles,
        7,
        classificationRanges,
        particleEntityType,
        animationFactory,
        calculateCharacterAffinities(),
        localStorageLoadLevelDepthFunction,
        localStorageSaveLocationFunction
    );
    var initHandler = recordHandlerDelegateFactory(initHandlers);

    var startHandlers: { [_: number]: IRecordHandlerFunction<State, IRecord<StateRunner>> } = {};
    var introStart = introStartFactory(introElement, introPlayButton, introRestartButton, localStorageLoadLocationFunction, localStorageSaveLocationFunction, entityTypeBits);
    startHandlers[STATE_INTRO] = introStart;
    startHandlers[STATE_LEVEL_PLAY] = levelPlayStartFactory(
        levelPlayElement,
        levelPlayContext,
        levelPlayMindHandler,
        playerInputs,
        5,
        easingInit(),
        effectInit(),
        animationFactory,
        collisionHandlerSearch,
        4000,
        0.00008,
        localStorageSaveLevelDepthFunction,
        webAudioToneSoundEffectFactory(audioContext, 'triangle', 1200, 1800, 400, 0, 0.08, 0.02, 0.15),
        webAudioToneSoundEffectFactory(audioContext, 'sawtooth', 300, -100, 100, 0.01, 0.05, 0.1, 0.3)
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
        t: STATE_INTRO,
        v: {

        }
    };
    var currentState = initHandler(currentStateKey);
    var currentStateRunner = startHandler(currentState, callback);

    _w.onresize = function () {
        stopHandler(currentStateRunner, currentStateKey);
        if (currentStateKey.t == STATE_LEVEL_PLAY) {
            // disable scrolling in
            let stateKeyLevelPlay = <ILevelPlayStateKey>currentStateKey.v;
            stateKeyLevelPlay.suppressScroll = true;
        }
        currentState = initHandler(currentStateKey);
        currentStateRunner = startHandler(currentState, callback);
    };
};