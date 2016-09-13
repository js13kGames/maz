interface ILevelPlayParticleEntityFactory {
    (
        cx: number, 
        cy: number,
        colors: string[], 
        quantity: number, 
        baseVelocityX: number, 
        baseVelocityY
    ): ILevelPlayEntity[]
}