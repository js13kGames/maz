interface IRecordLevelPlayEntityFilterFunction {
    (filterRecord: IRecord<LevelPlayEntityFilter>, entity: ILevelPlayEntity): boolean;
}