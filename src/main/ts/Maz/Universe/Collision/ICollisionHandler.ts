interface ICollisionHandler {
    filter: (entityType: IEntityType) => boolean;
    collisionResolution: IRecord<CollisionResolution>;
}