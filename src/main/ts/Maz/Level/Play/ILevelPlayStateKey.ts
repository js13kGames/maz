interface ILevelPlayStateKey {
    universe: IUniverse,
    x: number,
    y: number,
    z: number,
    players: ILevelPlayEntityDescription[], 
    playerEntryPoint?: Direction
}