interface IEntityType {
    character: string;
    backgroundColor?: string;
    foregroundColor: string;
    children: IRecord<IEntityType>[];
    classification: Classification;
}