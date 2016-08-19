import {Intro as I} from 'Intro/IntroStateKey'
import {Level as L} from 'Level/ILevelSelectStateKey'

export var STATE_KEY_INTRO = 0;
export var STATE_KEY_LEVEL = 1;

export type StateKey = I.IntroStateKey | L.ILevelSelectStateKey;