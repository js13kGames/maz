interface ILevelPlayState {
    key: ILevelPlayStateKey,
    renderOffsetX: number, 
    renderOffsetY: number,
    outlineWidth: number;
    entities: ILevelPlayEntity[],
    matrix: ILevelPlayMatrix<ILevelPlayEntity[]>,
    width: number,
    height: number,
    tileSize: number,
    rng: IRandomNumberGenerator
}