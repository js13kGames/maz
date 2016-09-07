interface IStateCompleteCallback {
    (nextState: IRecord<StateKey>): boolean;
}
