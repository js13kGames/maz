interface ILevelPlayEntity extends IRectangle {

    d: ILevelPlayEntityDescription;
    renderMask: HTMLCanvasElement;
    render: HTMLCanvasElement;
    renderContext: CanvasRenderingContext2D;
    renderNotDirty?: boolean;
    o: Orientation;
    offx: number;
    offy: number;
    font: string;
    r: number;
    foregroundFill: string | CanvasGradient;

    state: EntityState;
    anims: { [_:number]:ILevelPlayEntityAnimation };

    dead?: boolean;

    // movement
    vx: number;
    vy: number;
    updateStartOrientation?: Orientation;
    gravity?: boolean;

    // collisions
    updateStartX?: number;
    updateStartY?: number;
    excluded?: ILevelPlayEntity[];
}