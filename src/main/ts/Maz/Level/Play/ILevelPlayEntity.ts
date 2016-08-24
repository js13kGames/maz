interface ILevelPlayEntity {

    description: ILevelPlayEntityDescription;
    renderMask: HTMLCanvasElement;
    render: HTMLCanvasElement;
    renderContext: CanvasRenderingContext2D;
    x: number;
    y: number;
    baseWidth: number;
    baseHeight: number;
    offsetX: number;
    offsetY: number;
    rotation: number;
}