interface ILevelPlayState {
    key: ILevelPlayStateKey,
    renderOffsetX: number, 
    renderOffsetY: number,
    outlineWidth: number;
    entities: ILevelPlayEntity[],
    matrix: ILevelPlayMatrix<ILevelPlayEntity[]>,
    entityTypeDecisionCaches: {[_: string]: ILevelPlayEntityMindDecisionCache},
    width: number,
    height: number,
    tileSize: number,
    rng: IRandomNumberGenerator,
    ageMillis: number,
    tween?: ITween,
    levelName: string,
    levelFont: string,
    levelColors: string[],
    levelBackground: CanvasGradient,
    particleFactory: ILevelPlayParticleEntityFactory
}