interface ILevelPlayEntity extends IRectangle {

    description: ILevelPlayEntityDescription;
    renderMask: HTMLCanvasElement;
    render: HTMLCanvasElement;
    renderContext: CanvasRenderingContext2D;
    renderNotDirty?: boolean;
    baseWidth: number;
    baseHeight: number;
    offsetX: number;
    offsetY: number;
    font: string;
    rotation: number;

    animations: { [_:string]:ILevelPlayEntityAnimation };

    dead?: boolean;

    // movement
    velocityX: number;
    velocityY: number;
    updateStartX?: number;
    updateStartY?: number;
    updateDurationOffset?: number;
}