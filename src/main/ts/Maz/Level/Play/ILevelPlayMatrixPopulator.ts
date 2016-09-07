interface ILevelPlayMatrixPopulator {
    (stateKey: ILevelPlayStateKey, matrix: ILevelPlayMatrix<ILevelPlayEntityDescription[]>, validEntityTypes: IEntityType[], difficulty: number, rng: IRandomNumberGenerator): void;
}