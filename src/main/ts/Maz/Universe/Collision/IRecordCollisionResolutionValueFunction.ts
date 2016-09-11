interface IRecordCollisionResolutionValueFunction {
    (collisionResolution: IRecord<CollisionResolution>, state: State, entityTypeFrom: IEntityType, entityTypeWith: IEntityType): number;
}