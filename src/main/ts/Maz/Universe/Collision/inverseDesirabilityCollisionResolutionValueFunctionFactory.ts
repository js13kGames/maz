function inverseDesirabilityCollisionResolutionValueFunctionFactory() {
    let handlers: { [_: number]: ICollisionResolutionValueFunction } = {};

    handlers[COLLISION_RESOLUTION_TYPE_DIE] = collisionResolutionValueAgressionFunctionFactory(1);

    return recordHandlerDelegateFactory(handlers, 0);
}