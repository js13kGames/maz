function rectangleOverlaps(r1: IRectangle, r2: IRectangle): boolean {
    let maxx1 = r1.x + r1.width;
    let maxx2 = r2.x + r2.width;
    let result;
    if (r1.x >= r2.x && r1.x < maxx2 || r2.x >= r1.x && r2.x < maxx1) {
        let maxy1 = r1.y + r1.height;
        let maxy2 = r2.y + r2.height;
        result = (r1.y >= r2.y && r1.y < maxy2 || r2.y >= r1.y && r2.y < maxy1);
    } else {
        result = false;
    }
    return result;
}