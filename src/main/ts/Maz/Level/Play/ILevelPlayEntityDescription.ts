interface ILevelPlayEntityDescription {
    mind: IRecord<LevelPlayEntityMind>;
    t: IEntityType;
    initialOrientation?: Orientation;
    side: Side;
}