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
            entityTypes[CLASSIFICATION_WALL] = [{
                backgroundColor: COLOR_WHITE,
                foregroundColor: '#EEE',
                children: [],
                character: '#',
                classification: CLASSIFICATION_WALL,
                speed: 0
            }];
            var universe: IUniverse = {
                seed: universeSeed,
                entityTypes: entityTypes
            };
            var playerType: IEntityType = {
                foregroundColor: COLOR_WHITE,
                character: '@',
                children: [],
                classification: CLASSIFICATION_MONSTER,
                speed: 4
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
