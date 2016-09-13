function newCanvas(w?: number, h?: number): HTMLCanvasElement {
    let canvas = <HTMLCanvasElement>_d.createElement('canvas');
    if (w) {
        canvas.width = w;
    }
    if (h) {
        canvas.height = h;
    }
    return canvas;
}