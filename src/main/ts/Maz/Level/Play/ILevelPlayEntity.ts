interface ILevelPlayEntity extends IRectangle {

    description: ILevelPlayEntityDescription;
    renderMask: HTMLCanvasElement;
    render: HTMLCanvasElement;
    renderContext: CanvasRenderingContext2D;
    baseWidth: number;
    baseHeight: number;
    offsetX: number;
    offsetY: number;
    rotation: number;

    dead?: boolean;

    // movement
    velocityX: number;
    velocityY: number;
    updateStartX?: number;
    updateStartY?: number;
    updateDurationOffset?: number;
}