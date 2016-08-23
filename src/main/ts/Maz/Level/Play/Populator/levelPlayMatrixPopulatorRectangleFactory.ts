function levelPlayMatrixPopulatorRectangleFactory(maxAttempts: number, crush: boolean, crushSwitchChance: number, modMin: boolean): ILevelPlayMatrixPopulator {

    var deltas = [
        {
            x: -1, 
            y: 0            
        }, {
            x: 1,
            y: 0
        }, {
            x: 0,
            y: -1
        }, {
            x: 0,
            y: 1
        }
    ];

    return function (matrix: ILevelPlayMatrix, validEntityTypes: IEntityType[], rng: IRandomNumberGenerator) {
        let maxBlockWidth = rng(rng() * (matrix.width - 2) ) + 1;
        let maxBlockHeight = rng(rng() * (matrix.height - 2) ) + 1;
        let minBlockWidth = rng(maxBlockWidth) + 1;
        let minBlockHeight = rng(maxBlockHeight) + 1;
        let rangeBlockWidth = maxBlockWidth - minBlockWidth;
        let rangeBlockHeight = maxBlockHeight - minBlockHeight;

        function isTileValid(x: number, y: number, validDeltas: boolean[]) {
            // check all around this tile is free
            let valid = true;
            for (let dx = -1; dx <= 1; dx++) {
                let xi = x + dx;
                for (let dy = -1; dy <= 1; dy++) {
                    let yi = y + dy;
                    let entities = matrix.tiles[xi][yi];
                    if (crush) {
                        entities.splice(0, entities.length);
                    }
                    valid = valid && !entities.length;
                }
            }
            if (valid && !crush) {
                // check that we have left enough room on all sides for remaining blocks
                for (let i in deltas) {
                    if (validDeltas[i] && valid) {
                        var delta = deltas[i];
                        let xi = x;
                        let yi = y;
                        // we count the current block, it's less code to set the start value to -1
                        let length = -1;
                        while (xi >= 0 && xi < matrix.width && yi >= 0 && yi < matrix.height && !matrix.tiles[xi][yi].length) {
                            length++;
                            xi += delta.x;
                            yi += delta.y;
                        }
                        var minLength = delta.x ? minBlockWidth : minBlockHeight;
                        if (length > 1 && length < minLength + 2) {
                            valid = false;
                            break;
                        }
                    }
                }
            }
            return valid;
        }

        function isRectangleValid(x: number, y: number, width: number, height: number) {
            let result = true;
            for (let xi = x + width; xi > x;) {
                xi--;
                for (let yi = y + height; yi > y;) {
                    yi--;
                    var validDeltas = [
                        xi == x,
                        xi == x + width - 1,
                        yi == y,
                        yi == y + height - 1
                    ];
                    result = result && isTileValid(xi, yi, validDeltas);
                }
            }
            return result;
        }

        function isDone() {
            return false;
        }


        let done = false;
        while (!done && minBlockWidth > 0 && minBlockHeight > 0) {
            let attempts = 0;
            while (attempts < maxAttempts && !done) {
                // TODO not all blocks need to be off the perimeter...
                var width = minBlockWidth + rng(rangeBlockWidth);
                var height = minBlockHeight + rng(rangeBlockHeight);
                var x = rng(matrix.width - width - 1);
                var y = rng(matrix.height - height - 1);
                if (modMin) {
                    x -= x % minBlockWidth;
                    y -= y % minBlockHeight;
                    if (rng() > 0.5) {
                        x += rng((matrix.width - 1) % (minBlockWidth + 1));
                        width = Math.min(width, matrix.width - x - 2);
                    }
                    if (rng() > 0.5) {
                        y += rng((matrix.height - 1) % (minBlockHeight + 1));
                        height = Math.min(height, matrix.height - y - 2);
                    }
                }
                x++;
                y++;
                var valid = x > 0 && y > 0 && isRectangleValid(x, y, width, height);
                if (valid) {
                    var entityTypeIndex = rng(validEntityTypes.length);
                    var entityType = validEntityTypes[entityTypeIndex];
                    for (var xi = x + width; xi > x;) {
                        xi--;
                        for (var yi = y + height; yi > y;) {
                            yi--;
                            matrix.tiles[xi][yi].push(entityType);
                        }
                    }
                }
                attempts++;
                done = isDone();
            }
            // reduce the block size to fill in any gaps or turn on crushing
            if (modMin) {
                modMin = false;
            } else if (!crush && rng() < crushSwitchChance) {
                crush = true;
            } else {
                if (minBlockHeight > minBlockWidth) {
                    minBlockHeight--;
                } else {
                    minBlockWidth--;
                }
            }
        }

    }
}