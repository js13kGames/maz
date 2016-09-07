var MIND_INERT = 0;
var MIND_MONSTER = 1;
var MIND_PLAYER_1 = 2;

type LevelPlayEntityMind = ILevelPlayEntityMindMonster | ILevelPlayEntityMindPlayer | LevelPlayEntityMindInert;