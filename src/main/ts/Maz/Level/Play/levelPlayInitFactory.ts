function levelPlayInitFactory(
    tileMargin: number,
    matrixPopulators: { [_: number]: ILevelPlayMatrixPopulator[] },
    containerElement: HTMLElement,
    canvasElement: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    minimumAreaTiles: number,
    minimumDimension: number
): IStateInitFunction {

    function fit(char: string, tileSize: number, tight: boolean, bold: boolean, outlineWidth: number, padding: number, context: CanvasRenderingContext2D) {
        let fits: boolean;
        let textWidth: number;
        let textHeight: number;
        let textOffsetX: number;
        let textOffsetY: number;
        let font: string;
        let canvas: HTMLCanvasElement;
        let fontSize = tileSize;
        let maxCanvas = document.createElement('canvas');
        do {
            font = toFont(fontSize, bold);
            fontSize--;
            context.font = font;
            let maxTextWidth = Math.ceil(context.measureText(char).width);
            let maxTextHeight = tileSize * 2;
            fits = true;
            maxCanvas.width = maxTextWidth;
            maxCanvas.height = maxTextHeight;
            let maxContext = maxCanvas.getContext('2d');
            maxContext.fillStyle = COLOR_WHITE;
            maxContext.font = font;
            maxContext.textBaseline = 'top';
            maxContext.fillText(char, 0, 0);
            if (outlineWidth) {
                maxContext.strokeStyle = COLOR_WHITE;
                maxContext.lineWidth = outlineWidth;
                maxContext.strokeText(char, 0, 0);
            }
            // make as tight as possible
            let data = maxContext.getImageData(0, 0, maxTextWidth, maxTextHeight);
            let minx = maxTextWidth;
            let maxx = 0;
            let miny = maxTextHeight;
            let maxy = 0;
            for (let x = maxTextWidth; x > 0;) {
                x--;
                for (let y = maxTextHeight; y > 0;) {
                    y--;
                    let d = data.data[(y * maxTextWidth + x) * 4 + 3];
                    if (d) {
                        minx = Math.min(minx, x);
                        maxx = Math.max(maxx, x);
                        miny = Math.min(miny, y);
                        maxy = Math.max(maxy, y);
                    } 
                }
            }

            textWidth = maxx - minx + 1;
            textHeight = maxy - miny + 1;

            if (textWidth > 0 && textHeight > 0) {
                let minSize = tileSize * (1 - tileMargin * 2);
                if (textWidth < minSize && textHeight < minSize) {

                    textWidth += padding * 2;
                    textHeight += padding * 2;
                    textOffsetX = -minx + padding;
                    textOffsetY = -miny + padding;

                    if (textWidth > textHeight) {
                        textOffsetY += (textWidth - textHeight) / 2;
                        textHeight = textWidth;
                    } else {
                        textOffsetX += (textHeight - textWidth) / 2;
                        textWidth = textHeight;
                    }

                    canvas = document.createElement('canvas');
                    canvas.width = textWidth;
                    canvas.height = textHeight;
                    let canvasContext = canvas.getContext('2d');
                    canvasContext.drawImage(maxCanvas, textOffsetX, textOffsetY);
                } else {
                    fits = false;
                }
            } else {
                // we've got a bad character!
                return null;
            }

        } while (!fits);

        if (!tight) {
            maxCanvas.width = tileSize;
            maxCanvas.height = tileSize;
            let maxContext = maxCanvas.getContext('2d');
            maxContext.fillStyle = COLOR_WHITE;
            maxContext.fillRect(0, 0, tileSize, tileSize);
            canvas = maxCanvas;
            textOffsetX = (tileSize - textWidth) / 2 + textOffsetX;
            textOffsetY = (tileSize - textWidth) / 2 + textOffsetY;
        }
        return {
            canvas: canvas,
            textOffsetX: textOffsetX,
            textOffsetY: textOffsetY,
            font: font
        }
    }

    return function (stateKey: ILevelPlayStateKey): IRecord<ILevelPlayState> {
        // work out the valid entities
        var levelSeed = stateKey.universe.seed + stateKey.x + stateKey.y * 100000;
        var levelRng = randomNumberGeneratorFactory(levelSeed);

        // TODO do not allow every monster in every level
        var validEntityTypes: { [_: number]: IEntityType[] } = stateKey.universe.entityTypes;

        var entitySeed = stateKey.universe.seed + stateKey.z + stateKey.y * 100 + stateKey.x * 10000;
        var entityRng = randomNumberGeneratorFactory(entitySeed);

        // calculate the dimensions of the level
        var containerWidth = containerElement.clientWidth;
        var containerHeight = containerElement.clientHeight;
        var containerArea = containerWidth * containerHeight;
        var tileSize = Math.floor(Math.sqrt(containerArea / minimumAreaTiles));
        var width = Math.ceil(containerWidth / tileSize);
        if (width < minimumDimension) {
            width = minimumDimension;
            tileSize = Math.ceil(minimumAreaTiles / width);
        }
        var height = Math.ceil(containerHeight / tileSize);
        if (height < minimumDimension) {
            height = minimumDimension;
            tileSize = Math.ceil(minimumAreaTiles / height);
        }

        let matrix = levelPlayMatrixCreate<ILevelPlayEntityDescription[]>(width, height, function () {
            return [];
        });

        canvasElement.width = containerWidth;
        canvasElement.height = containerHeight;

        let renderOffsetX = Math.ceil((containerWidth - width * tileSize) / 2);
        let renderOffsetY = Math.ceil((containerHeight - height * tileSize) / 2);
        let outlineWidth = Math.max(1, tileSize / 24);

        for (let classification = CLASSIFICATION_MIN_INDEX; classification <= CLASSIFICATION_MAX_INDEX; classification++) {
            let classificationMatrixPopulators = matrixPopulators[classification];
            let classificationValidEntityTypes = validEntityTypes[classification];
            if (classificationMatrixPopulators && classificationValidEntityTypes) {
                var matrixPopulatorIndex = levelRng(classificationMatrixPopulators.length);
                var matrixPopulator = classificationMatrixPopulators[matrixPopulatorIndex];
                matrixPopulator(stateKey, matrix, classificationValidEntityTypes, stateKey.z, entityRng);
            }
        }

        // add in the player entities
        let index = 0;
        let done = false;
        let entryPoint = stateKey.playerEntryPoint;
        let playerIndex = 0;
        while (!done) {
            let pos: IPoint;
            switch (entryPoint) {
                case DIRECTION_NORTH:
                    pos = {
                        x: index,
                        y: 0
                    }
                    break;
                default:
                case DIRECTION_SOUTH:
                    pos = {
                        x: index,
                        y: height - 1
                    }
                    break;
                case DIRECTION_EAST:
                    pos = {
                        x: width - 1,
                        y: index
                    }
                    break;
                case DIRECTION_WEST:
                    pos = {
                        x: 0,
                        y: index
                    }
                    break;
            }
            if (pos.x < matrix.width && pos.y < matrix.height) {
                index++;
                let entities = matrix.tiles[pos.x][pos.y];
                if (!entities.length) {
                    let playerDescription = stateKey.players[playerIndex];
                    entities.push(playerDescription);
                    playerIndex++;
                    if (stateKey.players.length <= playerIndex) {
                        done = true;
                    } 
                }
            } else {
                index = 0;
                entryPoint = (entryPoint + 1) % 5 + 1;
            }
        }


        let entities: ILevelPlayEntity[] = [];
        let entityMatrix = levelPlayMatrixCreate<ILevelPlayEntity[]>(width, height, function () {
            return [];
        });
        // turn the matrix into a list of entities
        for (let tx = 0; tx < width; tx++) {
            for (let ty = 0; ty < height; ty++) {
                let tile = matrix.tiles[tx][ty];
                for (let description of tile) {

                    var entityType = description.type;

                    let padding: number;
                    if (entityType.backgroundColor != null) {
                        padding = 0;
                    } else {
                        padding = Math.ceil(tileSize / 5);
                    }
                    let fitResult = fit(
                        entityType.character,
                        tileSize,
                        entityType.backgroundColor == null,
                        entityType.bold,
                        entityType.outline?outlineWidth:0,
                        padding,
                        context
                    );
                    let renderMask = fitResult.canvas;
                    let textWidth = renderMask.width;
                    let textHeight = renderMask.height;
                    let entityWidth = textWidth;
                    let entityHeight = textHeight;

                    let render = document.createElement('canvas');
                    render.width = entityWidth;
                    render.height = entityHeight;
                    let renderContext = render.getContext('2d');
                    renderContext.font = fitResult.font;
                    renderContext.textBaseline = 'top';

                    let entity: ILevelPlayEntity = {
                        description: description,
                        x: tx * tileSize + (tileSize - textWidth) / 2,
                        y: ty * tileSize + (tileSize - textHeight) / 2,
                        width: entityWidth,
                        height: entityHeight,
                        orientation: ORIENTATION_FACING_RIGHT_FEET_DOWN,
                        rotation: 0,
                        offsetX: fitResult.textOffsetX,
                        offsetY: fitResult.textOffsetY,
                        font: fitResult.font,
                        renderMask: renderMask,
                        render: render,
                        renderContext: renderContext,
                        velocityX: 0,
                        velocityY: 0,
                        animations: {}
                    };
                    entities.push(entity);
                    levelPlayEntityMatrixAdd(entityMatrix, tileSize, entity);
                }
            }
        }

        return {
            type: STATE_LEVEL_PLAY,
            value: {
                key: stateKey,
                renderOffsetX: renderOffsetX, 
                renderOffsetY: renderOffsetY,
                outlineWidth: outlineWidth,
                entities: entities,
                matrix: entityMatrix,
                width: width, 
                height: height,
                tileSize: tileSize,
                rng: entityRng
            }
        }
    }
}