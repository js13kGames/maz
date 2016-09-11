var MIND_INERT = 0;
var MIND_MONSTER = 1;
var MIND_PLAYER_1 = 2;
var MIND_PARTICLE = 3;

type LevelPlayEntityMind = ILevelPlayEntityMindMonster | ILevelPlayEntityMindPlayer | LevelPlayEntityMindInert | ILevelPlayEntityMindParticle;