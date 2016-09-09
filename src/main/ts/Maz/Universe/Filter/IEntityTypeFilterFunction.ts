interface IEntityTypeFilterFunction {
    (filter: EntityTypeFilter, entityType: IEntityType): boolean;
}