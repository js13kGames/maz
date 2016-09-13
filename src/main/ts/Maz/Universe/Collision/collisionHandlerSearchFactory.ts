function collisionHandlerSearchFactory(recordEntityFilterFunction: IRecordLevelPlayEntityFilterFunction): ICollisionHandlerSearch {
    return function (entityFrom: ILevelPlayEntity, entityWith: ILevelPlayEntity) {
        let entityType = entityFrom.d.t;
        while (entityType) {
            for (let collisionHandler of entityType.collisionHandlers) {
                let ok = true;

                for (let filter of collisionHandler.filters) {
                    ok = recordEntityFilterFunction(filter, entityWith);
                    if (!ok) {
                        break;
                    }
                }
                if (ok) {
                    //result.push(collisionHandler.collisionResolution);
                    return collisionHandler.collisionResolution;
                }
            }
            entityType = entityType.parent;
        }
    }
}