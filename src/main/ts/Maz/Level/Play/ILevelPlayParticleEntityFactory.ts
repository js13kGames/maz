interface ILevelPlayParticleEntityFactory {
    (
        cx: number, 
        cy: number,
        colors: string[], 
        quantity: number
    ): ILevelPlayEntity[]
}