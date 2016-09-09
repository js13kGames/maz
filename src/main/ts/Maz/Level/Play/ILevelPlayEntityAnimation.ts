let ENTITY_ANIMATION_BASE = 1;
let ENTITY_ANIMATION_TURN = 2;

interface ILevelPlayEntityAnimation {
    tweens: ITween[];
    age?: number;
}