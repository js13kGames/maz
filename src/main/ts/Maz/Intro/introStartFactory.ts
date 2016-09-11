function introStartFactory(
    intro: HTMLElement,
    playButton: HTMLElement,
    restartButton: HTMLElement
): IStateStartFunction {
    return function (state: IIntroState, nextStateCallback: IStateCompleteCallback): IRecord<IntroStateRunner> {

        let entityTypeBits = 3;
        let entityTypeCount = 1 << entityTypeBits;

        let globalAnimations: { [_: number]: IRecord<Animation> } = {};
        globalAnimations[ENTITY_STATE_DYING] = {
            type: ANIMATION_TYPE_DIE_STANDARD, 
            value: {
                durationMillis: 600
            }
        };

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
            let monsterFilters: IRecord<EntityTypeFilter>[] = [{
                type: ENTITY_TYPE_FILTER_CLASSIFICATION, 
                value: {
                    classifications: [CLASSIFICATION_MONSTER]
                }
            }];

            // walls
            let wallCollisionHandlers: ICollisionHandler[] = [
            ];

            let wallCharacters = '%#≡⁞';
            let wallEntityTypes: IEntityType[] = [];
            for (let i = 0; i < entityTypeCount; i++) {
                let wallCharacter = wallCharacters.charAt(rng(wallCharacters.length));
                let wallColors = randomColor(rng, 4);
                wallEntityTypes.push({
                    backgroundColor: wallColors[2],
                    foregroundColor: [wallColors[3]],
                    children: [],
                    character: wallCharacter,
                    bold: true,
                    classification: CLASSIFICATION_WALL,
                    speed: 0,
                    observationTimeoutMillis: 5000,
                    minDecisionTimeoutMillis: 5000,
                    varianceDecisionTimeoutMillis: 3000,
                    collisionHandlers: wallCollisionHandlers,
                    animations: globalAnimations
                });
            }
            entityTypes[CLASSIFICATION_WALL] = wallEntityTypes;

            // monsters
            let monsterCollisionHandlers: ICollisionHandler[] = [
                {
                    filters: wallFilters,
                    collisionResolution: {
                        type: COLLISION_RESOLUTION_TYPE_SOLID
                    }
                }
            ];
            let monsterAnimations: { [_: number]: IRecord<Animation> } = mapCopy(globalAnimations);
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
                    character: monsterCharacter,
                    outline: true,
                    bold: true,
                    children: [],
                    classification: CLASSIFICATION_MONSTER,
                    speed: (0.5 + rng()) * 0.002,
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
            let collectableEntityTypes: IEntityType[] = [];
            for (let i = 0; i < entityTypeCount; i++) {
                // all the same, just different colours
                collectableEntityTypes.push({
                    character: '.',
                    children: [],
                    classification: CLASSIFICATION_COLLECTABLE_COMMON,
                    speed: 0,
                    observationTimeoutMillis: 10000,
                    minDecisionTimeoutMillis: 500,
                    varianceDecisionTimeoutMillis: 100,
                    collisionHandlers: collectableCommonCollisionHandlers,
                    animations: globalAnimations
                });
            }
            entityTypes[CLASSIFICATION_COLLECTABLE_COMMON] = collectableEntityTypes;

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
                },
                {
                    filters: monsterFilters,
                    collisionResolution: {
                        type: COLLISION_RESOLUTION_TYPE_DIE
                    }
                }
            ];

            var playerAnimations: { [_: number]: IRecord<Animation> } = mapCopy(globalAnimations);
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
                foregroundColor: [COLOR_WHITE],
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
                    let colors = randomColor(rng, 4);
                    if (!entityType.foregroundColor) {
                        entityType.foregroundColor = colors;
                    } 
                    entityType.cowardliness = rng();
                    entityType.aggression = rng();
                    entityType.dedication = 0.5 + rng()/2;
                    entityType.hunger = rng();
                    entityType.distractibility = rng() * rng();
                    entityType.turnCost = rng() * rng() * 25;
                    entityType.tileCost = 1;
                    entityType.flipCost = rng(25);
                    entityType.visionRange = rng(5) + 5;
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
