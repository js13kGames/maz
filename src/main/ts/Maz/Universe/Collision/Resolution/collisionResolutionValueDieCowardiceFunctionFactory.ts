function collisionResolutionValueDieCowardiceFunctionFactory(baseCowardiceDesirability: number) {
    return function (collisionResolution: CollisionResolution, state: ILevelPlayState, entityType: IEntityType, withEntityType: IEntityType) {
        return baseCowardiceDesirability * entityType.cowardliness;
    }

}