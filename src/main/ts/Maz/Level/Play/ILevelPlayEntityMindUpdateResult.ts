interface ILevelPlayEntityMindUpdateResult {
    newEntities?: ILevelPlayEntity[];
    // new animations for this entity
    newAnimations?: { [_: number]: ILevelPlayEntityAnimation };
    // removed animations for this entity
    deletedAnimationIds?: string[];

    newDirection?: Direction;
    newState?: IRecord<StateKey>;
    newEntityState?: EntityState;
    dead?: boolean;
}