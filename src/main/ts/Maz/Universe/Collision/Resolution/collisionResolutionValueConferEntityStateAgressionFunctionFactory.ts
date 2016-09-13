function collisionResolutionValueConferEntityStateAgressionFunctionFactory(entityState: EntityState, baseAggressionDesirability: number, stateAgeAggressionDivisor: number): ICollisionResolutionValueFunction {
    return function (collisionResolution: ICollisionResolutionConferEntityState, state: ILevelPlayState, entityType: IEntityType, withEntityType: IEntityType): number {
        let result: number;
        // TODO check the actual entity isn't already in that state
        if (collisionResolution.entityState == entityState) {
            result = baseAggressionDesirability * (entityType.aggression * (1 + state.ageMillis / stateAgeAggressionDivisor));
        } else {
            result = 0;
        }
        return result;
    }
}