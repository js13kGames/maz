interface ICollisionHandlerSearch {
    (from: ILevelPlayEntity, withEntity: ILevelPlayEntity): IRecord<CollisionResolution>;
}