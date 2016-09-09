function introStartFactory(
    intro: HTMLElement,
    playButton: HTMLElement,
    restartButton: HTMLElement
): IStateStartFunction {
    return function (state: IIntroState, nextStateCallback: IStateCompleteCallback): IRecord<IntroStateRunner> {

        let entityTypeBits = 3;
        let entityTypeCount = 1 << entityTypeBits;

        // bind any event handlers
        playButton.onclick = function () {
            let universeSeed = Math.ceil(Math.random() * 1000000);
            let rng = randomNumberGeneratorFactory(universeSeed);
            let entityTypes: { [_: number]: IEntityType[] } = {};

            // common filters
            let wallFilters: IRecord<EntityTypeFilter>[] = [{
                type: ENTITY_TYPE_FILTER_CLASSIFICATION, 
                value: {
                    classifications: [CLASSIFICATION_WALL]
                }
            }];
            let collectableFilters: IRecord<EntityTypeFilter>[] = [{
                type: ENTITY_TYPE_FILTER_CLASSIFICATION,
                value: {
                    classifications: [CLASSIFICATION_COLLECTABLE_COMMON, CLASSIFICATION_COLLECTABLE_RARE]
                }
            }];

            // walls
            let wallCollisionHandlers: ICollisionHandler[] = [
            ];

            entityTypes[CLASSIFICATION_WALL] = [{
                backgroundColor: '#9AA',
                foregroundColor: '#DEE',
                children: [],
                character: '#',
                bold: true,
                classification: CLASSIFICATION_WALL,
                speed: 0,
                observationTimeoutMillis: 10000,
                minDecisionTimeoutMillis: 500,
                varianceDecisionTimeoutMillis: 100,
                collisionHandlers: wallCollisionHandlers,
                animations: {}
            }, {
                    backgroundColor: '#A9A',
                    foregroundColor: '#EDE',
                    children: [],
                    character: '%',
                    bold: true,
                    classification: CLASSIFICATION_WALL,
                    speed: 0,
                    observationTimeoutMillis: 10000,
                    minDecisionTimeoutMillis: 500,
                    varianceDecisionTimeoutMillis: 100,
                    collisionHandlers: wallCollisionHandlers,
                    animations: {}
                }];

            // monsters
            let monsterCollisionHandlers: ICollisionHandler[] = [
                {
                    filters: wallFilters,
                    collisionResolution: {
                        type: COLLISION_RESOLUTION_TYPE_SOLID
                    }
                }
            ];
            let monsterAnimations: { [_: number]: IRecord<Animation> } = {};
            monsterAnimations[ENTITY_STATE_IDLE] = {
                type: ANIMATION_TYPE_HOP,
                value: {
                    durationMillis: 400,
                    hopHeightScale: 0.1,
                    squishXScale: 0.1,
                    squishYScale: -0.1
                }
            };
            monsterAnimations[ENTITY_STATE_MOVING] = {
                type: ANIMATION_TYPE_HOP,
                value: {
                    durationMillis: 300,
                    hopHeightScale: 0.3,
                    squishXScale: 0.35,
                    squishYScale: -0.45
                }
            };

            let monsterCharacters = 'abcefghijklmnoprstuvwxyz';
            let monsterEntityTypes: IEntityType[] = [];

            for (let i = 0; i < entityTypeCount; i++) {
                let monsterCharacterIndex = rng(monsterCharacters.length);
                let monsterCharacter = monsterCharacters.charAt(monsterCharacterIndex);
                monsterCharacters = monsterCharacters.replace(monsterCharacter, '');

                monsterEntityTypes.push({
                    foregroundColor: COLOR_RED,
                    character: monsterCharacter,
                    outline: true,
                    children: [],
                    classification: CLASSIFICATION_MONSTER,
                    speed: (2 + rng()) * 0.001,
                    observationTimeoutMillis: 999 + rng(999),
                    minDecisionTimeoutMillis: 500 + rng(999),
                    varianceDecisionTimeoutMillis: 99 + rng(99),
                    collisionHandlers: monsterCollisionHandlers,
                    animations: monsterAnimations
                });
            }
            entityTypes[CLASSIFICATION_MONSTER] = monsterEntityTypes;

            // collectables - common
            let collectableCommonCollisionHandlers: ICollisionHandler[] = [
            ];
            entityTypes[CLASSIFICATION_COLLECTABLE_COMMON] = [{
                foregroundColor: '#FF6',
                character: '.',
                children: [],
                classification: CLASSIFICATION_COLLECTABLE_COMMON,
                speed: 0,
                observationTimeoutMillis: 10000,
                minDecisionTimeoutMillis: 500,
                varianceDecisionTimeoutMillis: 100,
                collisionHandlers: collectableCommonCollisionHandlers,
                animations: {}
            }];

            // player
            let playerCollisionHandlers: ICollisionHandler[] = [
                {
                    filters: wallFilters,
                    collisionResolution: {
                        type: COLLISION_RESOLUTION_TYPE_SOLID
                    }
                },
                {
                    filters: collectableFilters,
                    collisionResolution: {
                        type: COLLISION_RESOLUTION_TYPE_EAT
                    }
                }
            ];

            var playerAnimations: { [_: number]: IRecord<Animation> } = {};
            playerAnimations[ENTITY_STATE_IDLE] = {
                type: ANIMATION_TYPE_THROB,
                value: {
                    durationMillis: 900, 
                    scaleX: 0.2, 
                    scaleY: -0.2
                }
            };
            playerAnimations[ENTITY_STATE_MOVING] = {
                type: ANIMATION_TYPE_WALK, 
                value: {
                    durationMillis: 300, 
                    rotateAngle: Math.PI/8,
                    scaleX: 0.5,
                    hopHeightScale: 0.1
                    
                }
            };
            var playerType: IEntityType = {
                foregroundColor: COLOR_WHITE,
                character: '@',
                //character: '➯',
                //character: '\ud83d\ude03',
                //character: '☻',
                bold: true,
                children: [],
                classification: CLASSIFICATION_MONSTER,
                speed: 0.0025,
                observationTimeoutMillis: 1000,
                minDecisionTimeoutMillis: 500,
                varianceDecisionTimeoutMillis: 100,
                collisionHandlers: playerCollisionHandlers,
                animations: playerAnimations
            };

            // randomly generate some behaviors
            for (let key in entityTypes) {
                let entityTypeList = entityTypes[key];
                for (let entityType of entityTypeList) {
                    entityType.bravery = rng();
                    entityType.aggression = rng();
                    entityType.dedication = 0.5 + rng()/2;
                    entityType.hunger = rng();
                    entityType.distractibility = rng();
                    entityType.turnCost = rng(3) + 1;
                    entityType.tileCost = rng(3) + 1;
                }
            }

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
