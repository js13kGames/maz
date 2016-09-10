function collisionResolutionValueAgressionFunctionFactory(baseAggressionDesirability: number): ICollisionResolutionValueFunction {
    return function (collisionResolution: CollisionResolution, entityType: IEntityType, withEntityType: IEntityType): number {
        return baseAggressionDesirability * entityType.aggression;
    }
}