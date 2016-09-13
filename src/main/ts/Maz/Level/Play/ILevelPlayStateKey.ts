interface ILevelPlayStateKey {
    universe: IUniverse,
    x: number,
    y: number,
    players: ILevelPlayEntityDescription[], 
    playerEntryPoint?: Direction,
    suppressScroll?: boolean
}