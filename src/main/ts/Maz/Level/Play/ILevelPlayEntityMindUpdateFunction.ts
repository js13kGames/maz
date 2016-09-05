interface ILevelPlayEntityMindUpdateFunction {
    (mind: LevelPlayEntityMind, state: ILevelPlayState, entity: ILevelPlayEntity): ILevelPlayEntityMindUpdateResult;
}