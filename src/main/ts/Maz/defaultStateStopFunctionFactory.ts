function defaultStateStopFunctionFactory(element: HTMLElement): IStateStopFunction {
    return function (runner: StateRunner) {
        element.setAttribute('class', 'h');
    }
}