interface IEntityType {
    character: string;
    backgroundColor?: string;
    foregroundColor: string;
    children: IRecord<IEntityType>[];
    classification: Classification;

    // physical metrics
    speed: number;
    // TODO abilities

    collisionHandlers: ICollisionHandler[];
}