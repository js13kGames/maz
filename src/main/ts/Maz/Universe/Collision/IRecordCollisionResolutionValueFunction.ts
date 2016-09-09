interface IRecordCollisionResolutionValueFunction {
    (collisionResolution: IRecord<CollisionResolution>, entityTypeFrom: IEntityType, entityTypeWith: IEntityType): number;
}