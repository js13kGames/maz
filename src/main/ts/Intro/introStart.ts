import {State, STATE_INTRO} from '../State';
import {IRecord} from '../IRecord';
import {IStateCompleteCallback} from '../IStateCompleteCallback';
import {Intro as I} from 'IIntroState';

export namespace Intro {

    export function introStart(v: void, e: Element, nextStateCallback: IStateCompleteCallback): IRecord<I.IIntroState> {

        // TODO show the intro screen
        var playButton = document.getElementById('play_button');
        var restartButton = document.getElementById('restart_button');

        // TODO bind any event handlers
        playButton.onclick = function () {
            nextStateCallback({
                
            });
        };


        return {
            type: STATE_INTRO,
            value: {

            }
        };
    }

}