import {State} from 'State';
import {StateKey} from 'StateKey';
import {IRecord} from 'IRecord';

export interface IStateInitFunction {
    (record: IRecord<StateKey>, e: Element): IRecord<State>;
}


