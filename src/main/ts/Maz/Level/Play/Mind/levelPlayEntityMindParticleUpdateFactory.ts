function levelPlayEntityMindParticleUpdateFactory(): ILevelPlayEntityMindUpdateFunction  {

    return function (mind: ILevelPlayEntityMindMonster, state: ILevelPlayState, entity: ILevelPlayEntity): ILevelPlayEntityMindUpdateResult {
        let result: ILevelPlayEntityMindUpdateResult = {};
        result.dead = !entity.anims[ENTITY_ANIMATION_TEMP];
        return result;
    }
}