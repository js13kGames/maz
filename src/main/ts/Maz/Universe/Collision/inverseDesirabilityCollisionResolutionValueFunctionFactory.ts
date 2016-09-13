function inverseDesirabilityCollisionResolutionValueFunctionFactory() {
    let handlers: { [_: number]: ICollisionResolutionValueFunction } = {};

    // TODO have some handlers for fear of dying
    handlers[COLLISION_RESOLUTION_TYPE_EAT] = collisionResolutionValueDieCowardiceFunctionFactory(-1);
    //handlers[COLLISION_RESOLUTION_TYPE_CONFER_ENTITY_STATE] = collisionResolutionValueConferEntityStateAgressionFunctionFactory(ENTITY_STATE_DYING, -1, 100000);

    return recordHandlerDelegateFactory(handlers, 0);
}