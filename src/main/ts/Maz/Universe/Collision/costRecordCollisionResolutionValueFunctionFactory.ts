function costRecordCollisionResolutionValueFunctionFactory(): IRecordCollisionResolutionValueFunction {
    let handlers: { [_: number]: ICollisionResolutionValueFunction } = {};

    handlers[COLLISION_RESOLUTION_TYPE_SOLID] = collisionResolutionValueConstantFunctionFactory(9999);
    // TODO
    //handlers[COLLISION_RESOLUTION_TYPE_DIG] = undefined; 

    return recordHandlerDelegateFactory(handlers, 1);
}