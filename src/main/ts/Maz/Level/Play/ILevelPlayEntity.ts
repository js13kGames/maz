interface ILevelPlayEntity extends IRectangle {

    description: ILevelPlayEntityDescription;
    renderMask: HTMLCanvasElement;
    render: HTMLCanvasElement;
    renderContext: CanvasRenderingContext2D;
    renderNotDirty?: boolean;
    orientation: Orientation;
    offsetX: number;
    offsetY: number;
    font: string;
    rotation: number;

    state: EntityState;
    animations: { [_:number]:ILevelPlayEntityAnimation };

    dead?: boolean;

    // movement
    velocityX: number;
    velocityY: number;
    updateStartOrientation?: Orientation;
    updateStartX?: number;
    updateStartY?: number;
    updateDurationOffset?: number;
}