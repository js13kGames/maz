function levelPlayEntityRotateRenderMask(entity: ILevelPlayEntity, fromOrientation: Orientation, toOrientation: Orientation) {
    if (toOrientation != fromOrientation) {
        let fromOrientationTransformation = ORIENTATION_TRANSFORMATIONS[fromOrientation];
        let toOrientationTransformation = ORIENTATION_TRANSFORMATIONS[toOrientation];
        let fromCount = (4 - fromOrientationTransformation.r) % 4;
        rotate(entity, fromCount);
        if (fromOrientationTransformation.flipY && !toOrientationTransformation.flipY || !fromOrientationTransformation.flipY && toOrientationTransformation.flipY) {
            flipY(entity);
        }
        rotate(entity, toOrientationTransformation.r);
    }
}

function rotate(entity: ILevelPlayEntity, count: number) {
    while (count > 0) {
        count--;
        let width = entity.renderMask.width;
        let height = entity.renderMask.height;
        let originalData = getContext(entity.renderMask).getImageData(0, 0, width, height);
        entity.renderMask.width = height;
        entity.renderMask.height = width;
        let context = getContext(entity.renderMask);
        let newData = context.getImageData(0, 0, height, width);
        for (let y = 0; y < height; y++) {
            let originalYoff = y * width * 4;
            let newX = (height - y - 1);
            let newXoff = newX * 4;
            for (let x = 0; x < width; x++) {
                let originalXoff = originalYoff + x * 4;
                let newY = x;
                let newYoff = newY * height * 4 + newXoff;
                for (let i = 0; i < 4; i++) {
                    newData.data[newYoff + i] = originalData.data[originalXoff + i];
                }
            }
        }
        context.putImageData(newData, 0, 0);
    }
}

function flipY(entity: ILevelPlayEntity) {
    let width = entity.renderMask.width;
    let height = entity.renderMask.height;
    let context = getContext(entity.renderMask);
    let data = context.getImageData(0, 0, width, height);
    let midY = floor(height / 2);
    for (let y = 0; y < midY; y++) {
        let newY = height - y - 1;
        if (newY != y) {
            let originalYoff = y * width * 4;
            let newYoff = newY * width * 4;
            for (let x = 0; x < width; x++) {
                let xoff = x * 4;
                let originalXoff = originalYoff + xoff;
                let newXoff = newYoff + xoff;
                for (let i = 0; i < 4; i++) {
                    let tmp = data.data[newXoff + i];
                    data.data[newXoff + i] = data.data[originalXoff + i];
                    data.data[originalXoff + i] = tmp;
                }
            }
        }
    }
    context.putImageData(data, 0, 0);

}
