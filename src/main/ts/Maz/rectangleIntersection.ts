function rectangleIntersection(r1: IRectangle, r2: IRectangle): IRectangle {

    let maxx1 = r1.x + r1.width;
    let maxx2 = r2.x + r2.width;
    let maxx = Math.max(r1.x, r2.x);

    let iw = Math.min(maxx1, maxx2) - maxx;

    let result: IRectangle;

    if (iw > 0) {
        let maxy1 = r1.y + r1.height;
        let maxy2 = r2.y + r2.height;
        let maxy = Math.max(r1.y, r2.y);
        let ih = Math.min(maxy1, maxy2) - maxy;
        if (ih > 0) {
            result = {
                x: maxx,
                y: maxy,
                width: iw, 
                height: ih
            }
        }
    }

    return result;

}