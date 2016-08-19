import {IStateCompleteCallback} from 'IStateCompleteCallback'
import {IRecord} from 'IRecord'
import {State, STATE_INTRO} from 'State'
import {StateKey, STATE_KEY_INTRO, STATE_KEY_LEVEL} from 'StateKey'
import {Intro as IntroStart} from 'Intro/introStart'
import {Intro as IntroStop} from 'Intro/introStop'
import {recordHandlerDelegateFactory } from 'recordHandlerDelegateFactory'
import {IRecordHandlerFunction} from 'IRecordHandlerFunction'

window.onload = () => {
    var startHandlers: { [_: number]: IRecordHandlerFunction<StateKey, void> } = {};
    startHandlers[STATE_KEY_INTRO] = IntroStart.introStart;
    //startHandlers[STATE_KEY_LEVEL] = L.levelStart;
    var startHandler = recordHandlerDelegateFactory(startHandlers);

    var stopHandlers: { [_: number]: IRecordHandlerFunction<State, void> } = {};
    stopHandlers[STATE_INTRO] = IntroStop.introStop;
    var stopHandler = recordHandlerDelegateFactory(stopHandlers);

    var e = document.getElementById('content');
    var currentState;
    var callback: IStateCompleteCallback = function (nextState: IRecord<StateKey>) {
        if (currentState) {
            stopHandler(currentState, e);
        }
        currentState = startHandler(nextState, e, callback);
    };
    IntroStart.introStart(null, e, callback);
};