interface ILevelPlayMatrixPopulator {
    (matrix: ILevelPlayMatrix<ILevelPlayEntityDescription[]>, validEntityTypes: IEntityType[], difficulty: number, rng: IRandomNumberGenerator): void;
}