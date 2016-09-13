let levelPLayEntityFilterFunctionClassification: ILevelPlayEntityFilterFunction = function (filter: ILevelPlayEntityFilterClassification, entity: ILevelPlayEntity) {
    return arrayContains(filter.classifications, entity.d.t.classification);
}