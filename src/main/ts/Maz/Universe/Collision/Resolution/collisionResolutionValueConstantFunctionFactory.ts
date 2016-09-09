function collisionResolutionValueConstantFunctionFactory(result: number): ICollisionResolutionValueFunction {
    return function () {
        return result;
    }
}