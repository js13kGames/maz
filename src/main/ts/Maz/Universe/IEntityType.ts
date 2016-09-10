interface IEntityType {
    character: string;
    bold?: boolean;
    outline?: boolean;
    backgroundColor?: string;
    foregroundColor: string;
    parent?: IEntityType;
    children: IEntityType[];
    classification: Classification;
    animations: { [_: number]: IRecord<Animation> };

    // physical metrics
    speed: number;
    observationTimeoutMillis: number;
    minDecisionTimeoutMillis: number;
    varianceDecisionTimeoutMillis: number;
    visionRange?: number;

    // BEHAVIOR
    // how willing is it to ignore dangerous stuff (0 = brave)
    cowardliness?: number;
    // how much does it seek out edible stuff
    hunger?: number;
    // how much does it seek out stuff it can kill
    aggression?: number;
    // how much does distance lessen desirability?
    dedication?: number;
    // how often will it get distracted by a random tile
    distractibility?: number;
    // the cost of turning 90 degrees
    turnCost?: number;
    // the cost of turning 180 degrees
    flipCost?: number;
    // the cost of crossing a tile
    tileCost?: number;


    // TODO abilities

    collisionHandlers: ICollisionHandler[];
}