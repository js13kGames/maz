let contextEffectSlideInFunction: IContextEffectFunction = function (
    effect: IEffectSlideIn,
    t: number,
    slideInRenderer: IRecordContextEffectRenderFunction,
    destinationCanvas: HTMLCanvasElement,
    destinationContext: CanvasRenderingContext2D
) {
    let renderers: IRecordContextEffectRenderFunction[];
    renderers = [effect.slideOutRenderer, slideInRenderer];
    let dx: number;
    let dy: number;

    let w = destinationCanvas.width;
    let h = destinationCanvas.height;

    switch (effect.d) {
        case DIRECTION_NORTH:
            dx = 0;
            dy = -h;
            break;
        case DIRECTION_SOUTH:
            dx = 0;
            dy = h;
            break;
        case DIRECTION_EAST:
            dx = w;
            dy = 0;
            break;
        case DIRECTION_WEST:
            dx = -w;
            dy = 0;
            break;
    }
    let x = dx * t;
    let y = dy * t;
    for (let renderer of renderers) {
        renderer(destinationContext, x, y);
        x -= dx;
        y -= dy;
    }

}