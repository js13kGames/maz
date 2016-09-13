interface ICollisionHandler {
    filters: IRecord<LevelPlayEntityFilter>[];
    collisionResolution: IRecord<CollisionResolution>;
}