interface ICollisionResolutionValueFunction {
    (collisionResolution: CollisionResolution, state: State, entityTypeFrom: IEntityType, entityTypeWith: IEntityType): number;
}