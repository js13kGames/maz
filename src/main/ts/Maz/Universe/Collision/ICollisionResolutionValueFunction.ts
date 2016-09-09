interface ICollisionResolutionValueFunction {
    (collisionResolution: CollisionResolution, entityTypeFrom: IEntityType, entityTypeWith: IEntityType): number;
}