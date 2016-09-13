interface ILevelPlayState {
    key: ILevelPlayStateKey,
    z: number,
    renderOffsetX: number, 
    renderOffsetY: number,
    ow: number;
    es: ILevelPlayEntity[],
    matrix: ILevelPlayMatrix<ILevelPlayEntity[]>,
    entityTypeDecisionCaches: {[_: string]: ILevelPlayEntityMindDecisionCache},
    width: number,
    height: number,
    tileSize: number,
    rng: IRandomNumberGenerator,
    ageMillis: number,
    gameOverTimeMillis?: number,
    levelWinTimeMillis?: number,
    tween?: ITween,
    levelName: string,
    levelFont: string,
    levelColors: string[],
    levelBackground: CanvasGradient,
    particleFactory: ILevelPlayParticleEntityFactory, 
    energy: number
}