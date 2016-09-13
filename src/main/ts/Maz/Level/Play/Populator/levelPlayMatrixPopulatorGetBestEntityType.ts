function levelPlayMatrixPopulatorGetBestEntityType(validEntityTypes: IEntityType[], entityNumber: number, difficulty: number, rng: IRandomNumberGenerator): () => IEntityType {
    let index;

    let requests = 0;
    let first: boolean;
    if (entityNumber < validEntityTypes.length) {
        index = entityNumber;
        first = true;
    } else {
        first = false;
        let count = validEntityTypes.length;
        let r = 1;
        while (count) {
            r *= rng();
            count--;
        }
        index = floor(r * validEntityTypes.length);
    }
    let baseEntityType = validEntityTypes[index];
    let ancestry: IEntityType[] = [];
    // devolve as required
    let entityType = baseEntityType;
    while (entityType != null) {
        ancestry.push(entityType);
        entityType = entityType.parent;
    }
    ancestry = ancestry.reverse();
    return function () {
        requests++;
        if (first) {
            first = false;
            return baseEntityType;
        } else {
            let entityType = validEntityTypes[index];
            // adjust for classifications (some types we want to be much rarer than others)
            let r = 1;
            let iterations = max(1, (entityType.classification + requests) / (difficulty + 1) );
            let count = 0;
            while (count < iterations) {
                r *= rng();
                count++;
            }
            return ancestry[floor(r * ancestry.length)];
        }
    }
}