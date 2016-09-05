function introStartFactory(
    intro: HTMLElement,
    playButton: HTMLElement,
    restartButton: HTMLElement
): IStateStartFunction {
    return function (state: IIntroState, nextStateCallback: IStateCompleteCallback): IRecord<IntroStateRunner> {

        // bind any event handlers
        playButton.onclick = function () {
            var universeSeed = Math.ceil(Math.random() * 1000000);
            var entityTypes: { [_: number]: IEntityType[] } = {};

            // common filters
            let wallFilter = function (entityType: IEntityType) {
                return entityType.classification == CLASSIFICATION_WALL;
            }
            let collectableFilter = function (entityType: IEntityType) {
                return entityType.classification == CLASSIFICATION_COLLECTABLE_COMMON || entityType.classification == CLASSIFICATION_COLLECTABLE_RARE;
            }

            // walls
            let wallCollisionHandlers: ICollisionHandler[] = [
            ];
            entityTypes[CLASSIFICATION_WALL] = [{
                backgroundColor: '#9AA',
                foregroundColor: '#DEE',
                children: [],
                character: '#',
                classification: CLASSIFICATION_WALL,
                speed: 0,
                collisionHandlers: wallCollisionHandlers
            }];

            // monsters
            let monsterCollisionHandlers: ICollisionHandler[] = [
                {
                    filter: wallFilter,
                    collisionResolution: {
                        type: COLLISION_RESOLUTION_TYPE_SOLID
                    }
                }
            ];
            entityTypes[CLASSIFICATION_MONSTER] = [{
                foregroundColor: COLOR_WHITE,
                character: 'a',
                children: [],
                classification: CLASSIFICATION_MONSTER,
                speed: 0.1,
                collisionHandlers: monsterCollisionHandlers
            }, {
                foregroundColor: COLOR_WHITE,
                character: 'e',
                children: [],
                classification: CLASSIFICATION_MONSTER,
                speed: 0.1,
                collisionHandlers: monsterCollisionHandlers
            }, {
                foregroundColor: COLOR_WHITE,
                character: 'i',
                children: [],
                classification: CLASSIFICATION_MONSTER,
                speed: 0.1,
                collisionHandlers: monsterCollisionHandlers
            }, {
                foregroundColor: COLOR_WHITE,
                character: 'o',
                children: [],
                classification: CLASSIFICATION_MONSTER,
                speed: 0.1,
                collisionHandlers: monsterCollisionHandlers
            }, {
                foregroundColor: COLOR_WHITE,
                character: 'u',
                children: [],
                classification: CLASSIFICATION_MONSTER,
                speed: 0.1,
                collisionHandlers: monsterCollisionHandlers
            }, {
                foregroundColor: COLOR_WHITE,
                character: 'n',
                children: [],
                classification: CLASSIFICATION_MONSTER,
                speed: 0.1,
                collisionHandlers: monsterCollisionHandlers
            }, {
                foregroundColor: COLOR_WHITE,
                character: 's',
                children: [],
                classification: CLASSIFICATION_MONSTER,
                speed: 0.1,
                collisionHandlers: monsterCollisionHandlers
            }, {
                foregroundColor: COLOR_WHITE,
                character: 'c',
                children: [],
                classification: CLASSIFICATION_MONSTER,
                speed: 0.1,
                collisionHandlers: monsterCollisionHandlers
            }];

            // collectables - common
            let collectableCommonCollisionHandlers: ICollisionHandler[] = [
            ];
            entityTypes[CLASSIFICATION_COLLECTABLE_COMMON] = [{
                foregroundColor: '#FF6',
                character: '.',
                children: [],
                classification: CLASSIFICATION_COLLECTABLE_COMMON,
                speed: 0,
                collisionHandlers: collectableCommonCollisionHandlers
            }];

            // player
            let playerCollisionHandlers: ICollisionHandler[] = [
                {
                    filter: wallFilter,
                    collisionResolution: {
                        type: COLLISION_RESOLUTION_TYPE_SOLID
                    }
                },
                {
                    filter: collectableFilter,
                    collisionResolution: {
                        type: COLLISION_RESOLUTION_TYPE_EAT
                    }
                }
            ];
            var playerType: IEntityType = {
                foregroundColor: COLOR_WHITE,
                character: '@',
                children: [],
                classification: CLASSIFICATION_MONSTER,
                speed: 0.0025,
                collisionHandlers: playerCollisionHandlers
            };

            var universe: IUniverse = {
                seed: universeSeed,
                entityTypes: entityTypes
            };
                
            nextStateCallback({
                type: STATE_LEVEL_PLAY,
                value: <ILevelPlayStateKey>{
                    universe: universe,
                    x: 0,
                    y: 0,
                    z: 0,
                    playerEntryPoint: DIRECTION_SOUTH,
                    players: [{
                        mind: {
                            type: MIND_PLAYER_1,
                            // player mind
                            value: {}
                        },
                        type: playerType
                    }]
                }
            });
        };
        // show the intro screen
        intro.removeAttribute('class');

        return {
            type: STATE_INTRO
        }
    }
}
