type Classification = number;

// order is important here (higher numbers are much less likely to have their mutated forms appear)
var CLASSIFICATION_PARTICLE: Classification = 0;
var CLASSIFICATION_MONSTER: Classification = 1;
var CLASSIFICATION_COLLECTABLE_RARE: Classification = 2;
var CLASSIFICATION_OBSTACLE: Classification = 3;
var CLASSIFICATION_COLLECTABLE_COMMON: Classification = 4;
var CLASSIFICATION_WALL: Classification = 5;

var CLASSIFICATION_MIN_INDEX = CLASSIFICATION_PARTICLE;
var CLASSIFICATION_MAX_INDEX = CLASSIFICATION_WALL;