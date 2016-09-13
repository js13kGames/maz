type LevelPlayEntityFilterId = number;

let LEVEL_PLAY_ENTITY_FILTER_CLASSIFICATION: LevelPlayEntityFilterId = 1;
let LEVEL_PLAY_ENTITY_FILTER_SIDE: LevelPlayEntityFilterId = 2;

type LevelPlayEntityFilter = ILevelPlayEntityFilterClassification | ILevelPlayEntityFilterSide;

function levelPlayEntityFilterInit(): IRecordLevelPlayEntityFilterFunction {

    let filterHandlers: {[_: number]: ILevelPlayEntityFilterFunction} = {};

    filterHandlers[LEVEL_PLAY_ENTITY_FILTER_CLASSIFICATION] = levelPLayEntityFilterFunctionClassification;
    filterHandlers[LEVEL_PLAY_ENTITY_FILTER_SIDE] = levelPlayEntityFilterFunctionSide;

    return recordHandlerDelegateFactory(filterHandlers);
}