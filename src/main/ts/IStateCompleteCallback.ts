import {IRecord} from 'IRecord';
import {StateKey} from 'StateKey';

export interface IStateCompleteCallback {
    (nextState: IRecord<StateKey>): void;
}