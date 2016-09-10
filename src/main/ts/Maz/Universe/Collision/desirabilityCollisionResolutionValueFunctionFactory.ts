function desirabilityCollisionResolutionValueFunctionFactory(): IRecordCollisionResolutionValueFunction {
    let handlers: { [_: number]: ICollisionResolutionValueFunction } = {};

    // TODO more
    // walls are not attractive to try and walk into
    handlers[COLLISION_RESOLUTION_TYPE_SOLID] = collisionResolutionValueConstantFunctionFactory(-999);

    return recordHandlerDelegateFactory(handlers, 0);
}