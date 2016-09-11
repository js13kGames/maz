function collisionResolutionValueAgressionFunctionFactory(baseAggressionDesirability: number, stateAgeAggressionDivisor: number): ICollisionResolutionValueFunction {
    return function (collisionResolution: CollisionResolution, state: ILevelPlayState, entityType: IEntityType, withEntityType: IEntityType): number {
        return baseAggressionDesirability * (entityType.aggression * (1 + state.ageMillis / stateAgeAggressionDivisor));
    }
}