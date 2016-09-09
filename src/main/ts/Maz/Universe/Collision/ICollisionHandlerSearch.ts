interface ICollisionHandlerSearch {
    (from: IEntityType, withEntityType: IEntityType): IRecord<CollisionResolution>;
}