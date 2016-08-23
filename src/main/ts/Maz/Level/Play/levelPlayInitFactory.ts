function levelPlayInitFactory(
    matrixPopulators: { [_: number]: ILevelPlayMatrixPopulator[] },
    containerElement: HTMLElement,
    canvasElement: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    minimumAreaTiles: number,
    minimumDimension: number
): IStateInitFunction {

    function fit(char: string, tileSize: number, tight: boolean, context: CanvasRenderingContext2D) {
        let font = toFont(tileSize);
        context.font = font;
        let maxTextWidth = context.measureText(char).width;
        let maxTextHeight = tileSize;
        let maxCanvas = document.createElement('canvas');
        let maxContext: CanvasRenderingContext2D;

        let textOffsetX;
        let textOffsetY;
        if (tight) {
            maxCanvas.width = maxTextWidth;
            maxCanvas.height = maxTextHeight;
            maxContext = maxCanvas.getContext('2d');
            maxContext.fillStyle = COLOR_WHITE;
            textOffsetX = 0;
            textOffsetY = 0;
            maxContext.font = font;
            maxContext.textBaseline = 'top';
            maxContext.fillText(char, 0, 0);
            // TODO make as tight as possible
            //let data = maxContext.getImageData(0, 0, maxTextWidth, maxTextHeight);
        } else {
            maxCanvas.width = tileSize;
            maxCanvas.height = tileSize;
            maxContext = maxCanvas.getContext('2d');
            maxContext.fillStyle = COLOR_WHITE;
            maxContext.fillRect(0, 0, tileSize, tileSize);
            textOffsetX = (tileSize - maxTextWidth) / 2;
            textOffsetY = 0;
        }
        return {
            canvas: maxCanvas,
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
        let tiles: IEntityType[][][] = [];
        for (let x = 0; x < width; x++) {
            let tilesX: IEntityType[][] = [];
            for (let y = 0; y < height; y++) {
                let tilesY: IEntityType[] = [];
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
        var entities: ILevelPlayEntity[] = [];
        // turn the matrix into a list of entities
        for (let tx = 0; tx < width; tx++) {
            for (let ty = 0; ty < height; ty++) {
                let tile = tiles[tx][ty];
                for (let entityType of tile) {

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
                        type: entityType,
                        x: tx * tileSize + (tileSize - textWidth)/2, 
                        y: ty * tileSize + (tileSize - textHeight)/2,
                        baseWidth: textWidth,
                        baseHeight: textHeight,
                        rotation: 0,
                        offsetX: fitResult.textOffsetX,
                        offsetY: fitResult.textOffsetY,
                        renderMask: renderMask,
                        render: render,
                        renderContext: renderContext
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