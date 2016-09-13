let ENTITY_ANIMATION_BASE = '1';
let ENTITY_ANIMATION_TURN = '2';
let ENTITY_ANIMATION_TEMP = '3';

interface ILevelPlayEntityAnimation {
    tweens: ITween[];
    age?: number;
}