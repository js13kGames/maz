function introStartFactory(
    intro: HTMLElement,
    playButton: HTMLElement,
    restartButton: HTMLElement,
    loadLocationFunction: IStorageLoadLocationFunction,
    saveLocationFunction: IStorageSaveLocationFunction, 
    entityTypeBits: number
): IStateStartFunction {

    let entityTypeCount = 1 << entityTypeBits;
    function startGameFactory(universeSeed: number, x: number, y: number, clear: boolean, nextStateCallback: IStateCompleteCallback) {

        let globalAnimations: { [_: number]: IRecord<Animation> } = {};
        globalAnimations[ENTITY_STATE_DYING] = {
            t: ANIMATION_TYPE_DIE_STANDARD,
            v: {
                durationMillis: 600
            }
        };

        

        return function () {

            if (clear) {
                localStorage.clear();
            }
            saveLocationFunction(universeSeed, x, y);

            let rng = randomNumberGeneratorFactory(universeSeed);
            let entityTypes: { [_: number]: IEntityType[] } = {};

            // common filters
            let wallFilters: IRecord<LevelPlayEntityFilter>[] = [{
                t: LEVEL_PLAY_ENTITY_FILTER_CLASSIFICATION,
                v: {
                    classifications: [CLASSIFICATION_WALL]
                }
            }];
            let collectableFilters: IRecord<LevelPlayEntityFilter>[] = [{
                t: LEVEL_PLAY_ENTITY_FILTER_CLASSIFICATION,
                v: {
                    classifications: [CLASSIFICATION_COLLECTABLE_COMMON, CLASSIFICATION_COLLECTABLE_RARE]
                }
            }];
            let playerFilters: IRecord<LevelPlayEntityFilter>[] = [{
                t: LEVEL_PLAY_ENTITY_FILTER_CLASSIFICATION,
                v: {
                    classifications: [CLASSIFICATION_MONSTER]
                }
            }, {
                    t: LEVEL_PLAY_ENTITY_FILTER_SIDE,
                    v: {
                        sides: [SIDE_PLAYER]
                    }

                }];

            let solidCollisionHandler: ICollisionHandler = {
                filters: wallFilters,
                collisionResolution: {
                    t: COLLISION_RESOLUTION_TYPE_SOLID
                }
            };


            // walls
            let wallCollisionHandlers: ICollisionHandler[] = [
            ];

            let wallCharacters = '%#';
            let wallEntityTypes: IEntityType[] = [];
            for (let i = 0; i < entityTypeCount; i++) {
                let wallCharacter = wallCharacters.charAt(rng(wallCharacters.length));
                let wallColors = randomColor(rng, 4);
                wallEntityTypes.push({
                    bg: wallColors[2],
                    fg: [wallColors[3]],
                    character: wallCharacter,
                    bold: true,
                    classification: CLASSIFICATION_WALL,
                    sp: 0,
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
                solidCollisionHandler,
                {
                    filters: playerFilters,
                    collisionResolution: {
                        t: COLLISION_RESOLUTION_TYPE_CONFER_ENTITY_STATE,
                        v: {
                            entityState: ENTITY_STATE_DYING
                        }
                    }
                }
            ];
            let monsterAnimations: { [_: number]: IRecord<Animation> } = mapCopy(globalAnimations);
            monsterAnimations[ENTITY_STATE_IDLE] = {
                t: ANIMATION_TYPE_HOP,
                v: {
                    durationMillis: 400,
                    hopHeightScale: 0.1,
                    squishXScale: 0.1,
                    squishYScale: -0.1
                }
            };
            monsterAnimations[ENTITY_STATE_MOVING] = {
                t: ANIMATION_TYPE_HOP,
                v: {
                    durationMillis: 300,
                    hopHeightScale: 0.3,
                    squishXScale: 0.35,
                    squishYScale: -0.45
                }
            };


            //let monsterCharacters = 'abcefghijklmnoprstuvwxyz';
            let monsterCharacters = 'acegiknorstuvwyz';
            let monsterEntityTypes: IEntityType[] = [];

            for (let i = 0; i < entityTypeCount; i++) {
                let monsterCharacterIndex = rng(monsterCharacters.length);
                let monsterCharacter = monsterCharacters.charAt(monsterCharacterIndex);
                monsterCharacters = monsterCharacters.replace(monsterCharacter, '');

                monsterEntityTypes.push({
                    character: monsterCharacter,
                    outline: true,
                    bold: true,
                    classification: CLASSIFICATION_MONSTER,
                    sp: 0,
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
                solidCollisionHandler
            ];
            let collectableAnimations: { [_: number]: IRecord<Animation>} = mapCopy(globalAnimations);
            collectableAnimations[ENTITY_STATE_MOVING] = {
                t: ANIMATION_TYPE_WALK,
                v: {
                    durationMillis: 500,
                    rotateAngle: pi / 10,
                    scaleX: 0.3,
                    hopHeightScale: 0.2
                }
            }; 
            let collectableEntityTypes: IEntityType[] = [];
            for (let i = 0; i < entityTypeCount; i++) {
                // all the same, just different colours
                collectableEntityTypes.push({
                    character: '.',
                    classification: CLASSIFICATION_COLLECTABLE_COMMON,
                    sp: 0,
                    observationTimeoutMillis: 9999,
                    minDecisionTimeoutMillis: 999,
                    varianceDecisionTimeoutMillis: 99,
                    collisionHandlers: collectableCommonCollisionHandlers,
                    animations: collectableAnimations
                });
            }
            entityTypes[CLASSIFICATION_COLLECTABLE_COMMON] = collectableEntityTypes;

            // player
            let playerCollisionHandlers: ICollisionHandler[] = [
                {
                    filters: wallFilters,
                    collisionResolution: {
                        t: COLLISION_RESOLUTION_TYPE_SOLID
                    }
                },
                {
                    filters: collectableFilters,
                    collisionResolution: {
                        t: COLLISION_RESOLUTION_TYPE_EAT
                    }
                }
            ];

            var playerAnimations: { [_: number]: IRecord<Animation> } = mapCopy(globalAnimations);
            playerAnimations[ENTITY_STATE_IDLE] = {
                t: ANIMATION_TYPE_THROB,
                v: {
                    durationMillis: 900,
                    scaleX: 0.2,
                    scaleY: -0.2
                }
            };
            playerAnimations[ENTITY_STATE_MOVING] = {
                t: ANIMATION_TYPE_WALK,
                v: {
                    durationMillis: 300,
                    rotateAngle: pi / 8,
                    scaleX: 0.5,
                    hopHeightScale: 0.1

                }
            };
            var playerType: IEntityType = {
                fg: [COLOR_WHITE],
                character: '@',
                //character: '➯',
                //character: '\ud83d\ude03',
                //character: '☻',
                bold: true,
                classification: CLASSIFICATION_MONSTER,
                sp: 0.0025,
                observationTimeoutMillis: 0,
                minDecisionTimeoutMillis: 0,
                varianceDecisionTimeoutMillis: 0,
                collisionHandlers: playerCollisionHandlers,
                animations: playerAnimations
            };

            // randomly generate some behaviors
            let claimedCharacters = '';

            for (let key in entityTypes) {
                let entityTypeList = entityTypes[key];
                for (let entityType of entityTypeList) {
                    let goodness = 1.5;
                    let aggression = rng();
                    goodness -= aggression;
                    let distractability = rng() * rng();
                    goodness += distractability;
                    let dedication = 0.5 + rng() / 2;
                    goodness -= dedication;

                    if (entityType.classification == CLASSIFICATION_MONSTER) {
                        entityType.sp = (1 + max(0, goodness) * rng()) * 0.001
                    }

                    let colors = randomColor(rng, 4);
                    if (!entityType.fg) {
                        entityType.fg = colors;
                    }
                    entityType.cowardliness = 1;
                    entityType.aggression = aggression;
                    entityType.dedication = dedication;
                    entityType.hunger = rng();
                    entityType.distractibility = distractability;
                    entityType.turnCost = rng() * rng() * 25;
                    entityType.tileCost = 1;
                    entityType.flipCost = rng(25);
                    entityType.visionRange = rng(5) + 5;
                    entityType.mutationSeed = rng(maxInt);

                    claimedCharacters += entityType.character;
                }

            }

            // TODO have a constant for the key
            if (!localStorage.getItem('cc')) {
                localStorage.setItem('cc', claimedCharacters);
            }

            var universe: IUniverse = {
                seed: universeSeed,
                entityTypes: entityTypes
            };

            nextStateCallback({
                t: STATE_LEVEL_PLAY,
                v: <ILevelPlayStateKey>{
                    universe: universe,
                    x: x,
                    y: y,
                    z: 0,
                    players: [{
                        mind: {
                            t: MIND_PLAYER_1,
                            // player mind
                            v: {}
                        },
                        t: playerType,
                        side: SIDE_PLAYER
                    }]
                }
            });
        }
    }

    return function (state: IIntroState, nextStateCallback: IStateCompleteCallback): IRecord<IntroStateRunner> {

        // bind any event handlers
        let newUniverseSeed: number = ceil(random() * maxInt);
        let location = loadLocationFunction();
        let existingUniverseSeed: number;
        let x: number;
        let y: number;
        if (location) {
            existingUniverseSeed = location.universeSeed;
            x = location.x;
            y = location.y;
        } else {
            existingUniverseSeed = newUniverseSeed;
            x = 0;
            y = 0;
        }
        playButton.onclick = startGameFactory(existingUniverseSeed, x, y, false, nextStateCallback);
        restartButton.onclick = startGameFactory(newUniverseSeed, 0, 0, true, nextStateCallback);
            
        // show the intro screen
        intro.removeAttribute('class');

        return {
            t: STATE_INTRO
        }
    }
}
