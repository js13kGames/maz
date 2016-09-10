interface ILevelPlayEntityMindMonster {
    nextDecisionAgeMillis?: number;
    lastDecisionPath?: IPoint[];
    decisionMatrix?: ILevelPlayMatrix<ILevelPlayEntityMindMonsterDecisionTile>;
}

interface ILevelPlayEntityMindMonsterDecisionTile {
    desirability?: number;
    danger?: number;
    cumulativeCost?: number;
    entryDirection?: Direction;
}