function introStart(v: void, e: Element, nextStateCallback: IStateCompleteCallback): IRecord<IIntroState> {

    // TODO show the intro screen
    var playButton = document.getElementById('intro_play_button');
    var restartButton = document.getElementById('intro_restart_button');
    var intro = document.getElementById('intro');

    // TODO bind any event handlers
    playButton.onclick = function () {
        nextStateCallback({
            type: STATE_KEY_INTRO,
            value: {
                seed: 0,
                mutations: [],
                x: 0,
                y: 0,
                z: 0
            }                
        });
    };
    intro.setAttribute('class', null);

    return {
        type: STATE_INTRO,
        value: {

        }
    }
}
