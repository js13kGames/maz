interface IStateStartFunction {
    (record: State, callback: IStateCompleteCallback): IRecord<StateRunner>;
}


