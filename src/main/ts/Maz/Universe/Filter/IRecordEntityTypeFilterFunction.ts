interface IRecordEntityTypeFilterFunction {
    (filterRecord: IRecord<EntityTypeFilter>, entityType: IEntityType): boolean;
}