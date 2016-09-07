function levelPlayEntityMindMonsterUpdateFactory(): ILevelPlayEntityMindUpdateFunction {
    return function (mind: LevelPlayEntityMind, state: ILevelPlayState, entity: ILevelPlayEntity): ILevelPlayEntityMindUpdateResult {
        let result: ILevelPlayEntityMindUpdateResult = {};
        if (entity.description.type.speed) {
            if (!entity.animations['x']) {
                result.newAnimations = {
                    x: animationMotionHop(300, entity.width, entity.height)
                };
            }
        }
        return result;
    }
}