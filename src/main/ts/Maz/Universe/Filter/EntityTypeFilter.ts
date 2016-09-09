type EntityTypeFilterId = number;

let ENTITY_TYPE_FILTER_CLASSIFICATION: EntityTypeFilterId = 1;

type EntityTypeFilter = IEntityTypeFilterClassification;

function entityTypeFilterInit(): IRecordEntityTypeFilterFunction {

    let filterHandlers: {[_: number]: IEntityTypeFilterFunction} = {};

    filterHandlers[ENTITY_TYPE_FILTER_CLASSIFICATION] = entityTypeFilterFunctionClassification;

    return recordHandlerDelegateFactory(filterHandlers);
}