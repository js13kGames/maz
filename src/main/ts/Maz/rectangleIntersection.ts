function rectangleIntersection(r1: IRectangle, r2: IRectangle): IRectangle {

    let maxx1 = r1.x + r1.w;
    let maxx2 = r2.x + r2.w;
    let maxx = max(r1.x, r2.x);

    let iw = min(maxx1, maxx2) - maxx;

    let result: IRectangle;

    if (iw > 0) {
        let maxy1 = r1.y + r1.h;
        let maxy2 = r2.y + r2.h;
        let maxy = max(r1.y, r2.y);
        let ih = min(maxy1, maxy2) - maxy;
        if (ih > 0) {
            result = {
                x: maxx,
                y: maxy,
                w: iw, 
                h: ih
            }
        }
    }

    return result;

}