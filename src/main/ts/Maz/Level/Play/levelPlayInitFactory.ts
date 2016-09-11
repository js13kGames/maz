function levelPlayInitFactory(
    tileMargin: number,
    matrixPopulators: { [_: number]: ILevelPlayMatrixPopulator[] },
    containerElement: HTMLElement,
    canvasElement: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    minimumAreaTiles: number,
    minimumDimension: number,
    classificationRanges: { [_: number]: IRange }, 
    particleType: IEntityType,
    recordAnimationTweenFactory: IRecordAnimationTweenFactory
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

        // do not allow every monster in every level
        var validEntityTypes: { [_: number]: IEntityType[] } = {};
        for (let classification in classificationRanges) {
            let range = classificationRanges[classification];
            let entityTypes = stateKey.universe.entityTypes[classification];
            if (entityTypes) {
                let count = range.min + levelRng(range.max - range.min + 1);
                let copy = entityTypes.concat.apply([], entityTypes);
                let classificationEntityTypes: IEntityType[] = [];
                while (count > 0 && copy.length) {
                    count--;
                    // TODO look up children too
                    let index = levelRng(copy.length);
                    let entityType = copy.splice(index, 1)[0];
                    classificationEntityTypes.push(entityType);
                }
                validEntityTypes[classification] = classificationEntityTypes;
            }
        }

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
            tileSize = Math.ceil(containerWidth / width);
            height = containerHeight / tileSize;
        }
        var height = Math.ceil(containerHeight / tileSize);
        if (height < minimumDimension) {
            height = minimumDimension;
            tileSize = Math.ceil(containerHeight / height);
            width = Math.ceil(containerWidth / tileSize);
        }

        let matrix = levelPlayMatrixCreate<ILevelPlayEntityDescription[]>(width, height, function () {
            return [];
        });

        if (canvasElement.width != containerWidth || canvasElement.height != containerHeight) {
            canvasElement.width = containerWidth;
            canvasElement.height = containerHeight;
        }

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
                    let playerMind = <ILevelPlayEntityMindPlayer>playerDescription.mind.value;
                    // don't walk straight out
                    playerMind.desiredDirection = null;

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

                    let foregroundColor: string | CanvasGradient;
                    if (entityType.foregroundColor.length > 1) {

                        //let gradient = renderContext.createLinearGradient(textWidth, 0, 0, textHeight);
                        let gx = textWidth * 0.8;
                        let gy = textHeight * 0.2;
                        let r = Math.max(textWidth, textHeight) * 0.8;
                        let gradient = renderContext.createRadialGradient(gx, gy, r / 5, gx, gy, r);  
                        gradient.addColorStop(0, entityType.foregroundColor[entityType.foregroundColor.length - 1]);
                        gradient.addColorStop(1, entityType.foregroundColor[1]);
                        foregroundColor = gradient;
                    } else {
                        foregroundColor = entityType.foregroundColor[0];
                    }

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
                        foregroundFill: foregroundColor,
                        velocityX: 0,
                        velocityY: 0,
                        animations: {},
                        state: ENTITY_STATE_IDLE
                    };
                    if (description.initialOrientation) {
                        levelPlayEntityRotateRenderMask(entity, ORIENTATION_FACING_RIGHT_FEET_DOWN, description.initialOrientation);
                        entity.orientation = description.initialOrientation;
                    }
                    entities.push(entity);
                    levelPlayEntityMatrixAdd(entityMatrix, tileSize, entity);
                }
            }
        }

        let previousCanvas = document.createElement('canvas');
        previousCanvas.width = containerWidth;
        previousCanvas.height = containerHeight;
        let previousContext = previousCanvas.getContext('2d');
        previousContext.drawImage(canvasElement, 0, 0);
        
        let tween: ITween;
        if (stateKey.playerEntryPoint && !stateKey.suppressScroll) {
            tween = {
                durationMillis: 500,
                easing: {
                    type: EASING_QUADRATIC_OUT
                },
                effect: {
                    type: EFFECT_SLIDE_IN,
                    value: {
                        slideOutRenderer: recordContextEffectRenderCanvasFactory(previousCanvas),
                        direction: stateKey.playerEntryPoint
                    }
                }
            };
        }

        let rowSeed = stateKey.universe.seed + stateKey.y;
        let previousRowRng = randomNumberGeneratorFactory(rowSeed - 1);
        let rowRng = randomNumberGeneratorFactory(rowSeed);

        let previousRowColors = randomColor(previousRowRng, 3);
        let levelColors = randomColor(rowRng, 3);
        let levelBackground = previousContext.createLinearGradient(0, 0, 0, containerHeight);
        levelBackground.addColorStop(0, previousRowColors[0]);
        levelBackground.addColorStop(1, levelColors[0]);

        let particleSize = tileSize / 8;

        let particleFactory: ILevelPlayParticleEntityFactory = function (
            cx: number, 
            cy: number, 
            colors: string[], 
            quantity: number
        ): ILevelPlayEntity[] {
            let results: ILevelPlayEntity[] = [];

            while (quantity) {
                quantity--;

                let angle = Math.random() * Math.PI;
                let velocity = particleType.speed / 2 + particleType.speed * Math.random();
                let velocityX = Math.cos(angle) * velocity;
                let velocityY = -Math.sin(angle) * velocity;

                let color = colors[levelRng(colors.length)];

                let canvas = document.createElement('canvas');
                canvas.width = particleSize;
                canvas.height = particleSize;
                let context = canvas.getContext('2d');
                context.fillStyle = color;
                context.fillRect(0, 0, particleSize, particleSize);

                let render = document.createElement('canvas');
                render.width = particleSize;
                render.height = particleSize;
                let renderContext = render.getContext('2d');

                let particleMind: IRecord<LevelPlayEntityMind> = {
                    type: MIND_PARTICLE, 
                    value: {
                    }
                };

                let animation: IRecord<Animation> = {
                    type: ANIMATION_TYPE_FADE, 
                    value: {
                        durationMillis: 999, 
                        startAlpha: 1, 
                        dAlpha: -1
                    }
                };
                let animations: { [_: number]: ILevelPlayEntityAnimation } = {
                };
                animations[ENTITY_ANIMATION_TEMP] = {
                    tweens: recordAnimationTweenFactory(animation, particleSize, particleSize), 
                    age: 0
                };

                let particle: ILevelPlayEntity = {
                    x: cx - particleSize / 2,
                    y: cy - particleSize / 2,
                    width: particleSize,
                    height: particleSize,
                    velocityX: velocityX, 
                    velocityY: velocityY, 
                    render: render, 
                    renderContext: renderContext,
                    renderMask: canvas,
                    foregroundFill: color,
                    offsetX: particleSize / 2,
                    offsetY: particleSize / 2, 
                    description: {
                        type: particleType, 
                        mind: particleMind
                    },
                    orientation: ORIENTATION_FACING_RIGHT_FEET_DOWN, 
                    font: null,
                    rotation: 0,
                    state: ENTITY_STATE_DYING, 
                    animations: animations, 
                    gravity: true                    
                };
                results.push(particle);
            }

            return results;
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
                entityTypeDecisionCaches: {},
                width: width, 
                height: height,
                tileSize: tileSize,
                rng: entityRng,
                ageMillis: 0,
                tween: tween,
                levelName: toStringWithSign(stateKey.x) + toStringWithSign(stateKey.y) + toStringWithSign(stateKey.z),
                levelFont: toFont(tileSize * 2, true, 'monospace'),
                levelColors: levelColors,
                levelBackground: levelBackground,
                particleFactory: particleFactory
            }
        }
    }
}