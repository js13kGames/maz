import {Intro as I} from 'IIntroState';

export namespace Intro {

    export function introStop(state: I.IIntroState, e: Element) {
        // hide the intro screen
        var intro = document.getElementById('intro');
        intro.setAttribute('class', 'hidden');
    }

}