import {State} from 'State';
import {IRecord} from 'IRecord';

export interface IStateDestroyFunction {
    (record: IRecord<State>, e: Element): void;
}