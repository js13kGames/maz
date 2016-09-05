interface ILevelPlayEntityMindUpdateResult {
    newEntities?: ILevelPlayEntity[];
    // new animations for this entity
    newAnimations?: { [_: string]: ILevelPlayEntityAnimation };
    // removed animations for this entity
    deletedAnimationIds?: string[];

    newOrientation?: Orientation;
}