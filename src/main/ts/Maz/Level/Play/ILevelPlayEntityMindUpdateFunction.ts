interface ILevelPlayEntityMindUpdateFunction {
    (state: ILevelPlayState, mind: LevelPlayEntityMind, entity: ILevelPlayEntity): ILevelPlayEntity[];
}