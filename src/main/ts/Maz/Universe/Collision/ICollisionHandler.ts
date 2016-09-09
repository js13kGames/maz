interface ICollisionHandler {
    filters: IRecord<EntityTypeFilter>[];
    collisionResolution: IRecord<CollisionResolution>;
}