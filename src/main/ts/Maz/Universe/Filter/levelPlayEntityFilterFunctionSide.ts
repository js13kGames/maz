let levelPlayEntityFilterFunctionSide: ILevelPlayEntityFilterFunction = function (filter: ILevelPlayEntityFilterSide, entity: ILevelPlayEntity) {
    return arrayContains(filter.sides, entity.d.side);
}