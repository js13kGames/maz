interface ILevelPlayState {
    entities: ILevelPlayEntity[],
    matrix: ILevelPlayMatrix<ILevelPlayEntity[]>,
    width: number,
    height: number,
    tileSize: number,
    rng: IRandomNumberGenerator
}