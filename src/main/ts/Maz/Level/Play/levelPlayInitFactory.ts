function levelPlayInitFactory(
    tileMargin: number,
    matrixPopulators: { [_: number]: ILevelPlayMatrixPopulator[] },
    containerElement: HTMLElement,
    canvasElement: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    minimumAreaTiles: number,
    minimumDimension: number
): IStateInitFunction {

    function fit(char: string, tileSize: number, tight: boolean, context: CanvasRenderingContext2D) {
        let fits: boolean;
        let textOffsetX: number;
        let textOffsetY: number;
        let font: string;
        let canvas: HTMLCanvasElement;
        let fontSize = tileSize;
        let maxCanvas = document.createElement('canvas');
        do {
            font = toFont(fontSize);
            fontSize--;
            context.font = font;
            let maxTextWidth = Math.ceil(context.measureText(char).width);
            let maxTextHeight = tileSize * 2;
            let textOffsetX;
            let textOffsetY;
            fits = true;
            maxCanvas.width = maxTextWidth;
            maxCanvas.height = maxTextHeight;
            let maxContext = maxCanvas.getContext('2d');
            maxContext.fillStyle = COLOR_WHITE;
            maxContext.font = font;
            maxContext.textBaseline = 'top';
            maxContext.fillText(char, 0, 0);
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

            let textWidth = maxx - minx + 1;
            let textHeight = maxy - miny + 1;

            if (textWidth > 0 && textHeight > 0) {
                let minSize = tileSize * (1 - tileMargin * 2);
                if (textWidth < minSize && textHeight < minSize) {
                    textOffsetX = -minx;
                    textOffsetY = -miny;

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
        var width = Math.floor(containerWidth / tileSize);
        if (width < minimumDimension) {
            width = minimumDimension;
            tileSize = Math.ceil(minimumAreaTiles / width);
        }
        var height = Math.floor(containerHeight / tileSize);
        if (height < minimumDimension) {
            height = minimumDimension;
            tileSize = Math.ceil(minimumAreaTiles / height);
        }
        let tiles: ILevelPlayEntityDescription[][][] = [];
        for (let x = 0; x < width; x++) {
            let tilesX: ILevelPlayEntityDescription[][] = [];
            for (let y = 0; y < height; y++) {
                let tilesY: ILevelPlayEntityDescription[] = [];
                tilesX.push(tilesY);
            }
            tiles.push(tilesX);
        }

        let matrix: ILevelPlayMatrix = {
            width: width, 
            height: height,
            tiles: tiles
        };

        canvasElement.width = width * tileSize;
        canvasElement.height = height * tileSize;

        for (let classification = CLASSIFICATION_MIN_INDEX; classification <= CLASSIFICATION_MAX_INDEX; classification++) {
            let classificationMatrixPopulators = matrixPopulators[classification];
            let classificationValidEntityTypes = validEntityTypes[classification];
            if (classificationMatrixPopulators && classificationValidEntityTypes) {
                var matrixPopulatorIndex = levelRng(classificationMatrixPopulators.length);
                var matrixPopulator = classificationMatrixPopulators[matrixPopulatorIndex];
                matrixPopulator(matrix, classificationValidEntityTypes, entityRng);
            }
        }

        // add in the player entities
        for (let i in stateKey.players) {
            let playerDescription = stateKey.players[i];
            let ii = parseInt(i);
            
            // find a free spot for the player to start in
            // TODO actually search for the spot
            let pos: IPoint;
            switch (stateKey.playerEntryPoint) {
                case DIRECTION_NORTH:
                    pos = {
                        x: Math.round(width / 2) + ii,
                        y: 0
                    }
                    break;
                default:
                case DIRECTION_SOUTH:
                    pos = {
                        x: Math.round(width / 2)+ii,
                        y: height - 1
                    }
                    break;
                case DIRECTION_EAST:
                    pos = {
                        x: width - 1,
                        y: Math.round(height / 2)+ii
                    }
                    break;
                case DIRECTION_WEST:
                    pos = {
                        x: 0,
                        y: Math.round(height / 2)+ii
                    }
                    break;
            }
            matrix.tiles[pos.x][pos.y].push(playerDescription);
        }



        var entities: ILevelPlayEntity[] = [];
        // turn the matrix into a list of entities
        for (let tx = 0; tx < width; tx++) {
            for (let ty = 0; ty < height; ty++) {
                let tile = tiles[tx][ty];
                for (let description of tile) {

                    var entityType = description.type;

                    let fitResult = fit(entityType.character, tileSize, entityType.backgroundColor == null, context);
                    let renderMask = fitResult.canvas;
                    let textWidth = renderMask.width;
                    let textHeight = renderMask.height;
                    let render = document.createElement('canvas');
                    render.width = textWidth;
                    render.height = textHeight;
                    let renderContext = render.getContext('2d');
                    renderContext.font = fitResult.font;
                    renderContext.textBaseline = 'top';


                    let entity: ILevelPlayEntity = {
                        description: description,                        
                        x: tx * tileSize + (tileSize - textWidth)/2, 
                        y: ty * tileSize + (tileSize - textHeight) / 2,
                        width: textWidth, 
                        height: textHeight,
                        baseWidth: textWidth,
                        baseHeight: textHeight,
                        rotation: 0,
                        offsetX: fitResult.textOffsetX,
                        offsetY: fitResult.textOffsetY,
                        renderMask: renderMask,
                        render: render,
                        renderContext: renderContext,
                        velocityX: 0,
                        velocityY: 0
                    };
                    entities.push(entity);
                }
            }
        }

        return {
            type: STATE_LEVEL_PLAY,
            value: {
                entities: entities,
                width: width, 
                height: height,
                tileSize: tileSize
            }
        }
    }
}