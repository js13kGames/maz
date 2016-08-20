interface IStateCompleteCallback {
    (nextState: IRecord<StateKey>): void;
}
