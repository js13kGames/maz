interface IStateStopFunction {
    (record: StateRunner, nextStateKey: IRecord<StateKey>): void;
}