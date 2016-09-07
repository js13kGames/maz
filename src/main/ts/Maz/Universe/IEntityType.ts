interface IEntityType {
    character: string;
    bold?: boolean;
    outline?: boolean;
    backgroundColor?: string;
    foregroundColor: string;
    children: IRecord<IEntityType>[];
    classification: Classification;

    // physical metrics
    speed: number;
    // TODO abilities

    collisionHandlers: ICollisionHandler[];
}