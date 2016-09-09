let entityTypeFilterFunctionClassification: IEntityTypeFilterFunction = function (filter: IEntityTypeFilterClassification, entityType: IEntityType) {
    return arrayContains(filter.classifications, entityType.classification);
}