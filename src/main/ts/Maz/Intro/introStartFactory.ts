function introStartFactory(
    intro: HTMLElement,
    playButton: HTMLElement,
    restartButton: HTMLElement
): IStateStartFunction {
    return function (state: IIntroState, nextStateCallback: IStateCompleteCallback): IRecord<IntroStateRunner> {

        // bind any event handlers
        playButton.onclick = function () {
            var universeSeed = Math.round(Math.random() * 1000000);
            var entityTypes: { [_: number]: IEntityType[] } = {};
            entityTypes[CLASSIFICATION_WALL] = [{
                backgroundColor: COLOR_WHITE,
                foregroundColor: '#EEE',
                children: [],
                character: '#',
                classification: CLASSIFICATION_WALL
            }];
            var universe: IUniverse = {
                seed: universeSeed,
                entityTypes: entityTypes
            };
            var playerType: IEntityType = {
                foregroundColor: COLOR_WHITE,
                character: '@',
                children: [],
                classification: CLASSIFICATION_MONSTER
            };
            var playerInputs: { [_: number]: IInputAtomic } = {};
            // NOTE: the inputs will be populated dynamically in the event handler, this can be empty
                
            var playerMind: ILevelPlayEntityMindPlayer = {
                inputs: playerInputs
            };

            nextStateCallback({
                type: STATE_LEVEL_PLAY,
                value: <ILevelPlayStateKey>{
                    universe: universe,
                    x: 0,
                    y: 0,
                    z: 0,
                    playerEntryPoint: DIRECTION_SOUTH,
                    player: {
                        mind: {
                            type: MIND_PLAYER,
                            value: playerMind
                        },
                        type: playerType
                    }
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
