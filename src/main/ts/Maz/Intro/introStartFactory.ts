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
            nextStateCallback({
                type: STATE_LEVEL_PLAY,
                value: {
                    universe: universe,
                    x: 0,
                    y: 0,
                    z: 0
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
