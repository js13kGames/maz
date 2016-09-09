function collisionHandlerSearchFactory(recordEntityTypeFilterFunction: IRecordEntityTypeFilterFunction): ICollisionHandlerSearch {
    return function (entityTypeFrom: IEntityType, entityTypeWith: IEntityType) {
        let entityType = entityTypeFrom;
        while (entityType) {
            for (let collisionHandler of entityType.collisionHandlers) {
                let ok = true;

                for (let filter of collisionHandler.filters) {
                    ok = recordEntityTypeFilterFunction(filter, entityTypeWith);
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