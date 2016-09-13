function levelPlayInitFactory(
    tileMargin: number,
    entityTypeBits: number,
    matrixPopulators: { [_: number]: ILevelPlayMatrixPopulator[] },
    containerElement: HTMLElement,
    canvasElement: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    minimumAreaTiles: number,
    minimumDimension: number,
    classificationRanges: { [_: number]: IRange }, 
    particleType: IEntityType,
    recordAnimationTweenFactory: IRecordAnimationTweenFactory,
    characterAffinities: { [_: string]: string },
    loadDepthFunction: IStorageLoadLevelDepthFunction,
    saveLocationFunction: IStorageSaveLocationFunction
): IStateInitFunction {

    let entityTypeMask = 0;
    for (let i = 0; i < entityTypeBits; i++) {
        entityTypeMask = (entityTypeMask << 1) | 1;        
    }
    let entityTypeCount = 1 << entityTypeBits;

    function fit(char: string, tileSize: number, tight: boolean, bold: boolean, outlineWidth: number, padding: number, context: CanvasRenderingContext2D) {
        let fits: boolean;
        let textWidth: number;
        let textHeight: number;
        let textOffsetX: number;
        let textOffsetY: number;
        let font: string;
        let canvas: HTMLCanvasElement;
        let fontSize = tileSize;
        let maxCanvas = newCanvas();
        do {
            font = toFont(fontSize, bold);
            fontSize--;
            context.font = font;
            let maxTextWidth = ceil(context.measureText(char).width);
            let maxTextHeight = tileSize * 2;
            fits = true;
            maxCanvas.width = maxTextWidth;
            maxCanvas.height = maxTextHeight;
            let maxContext = getContext(maxCanvas);
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
                        minx = min(minx, x);
                        maxx = max(maxx, x);
                        miny = min(miny, y);
                        maxy = max(maxy, y);
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

                    canvas = newCanvas(textWidth, textHeight);
                    let canvasContext = getContext(canvas);
                    canvasContext.drawImage(maxCanvas, textOffsetX, textOffsetY);
                } else {
                    fits = false;
                }
            } else {
                // we've got a bad character!
                return;// null;
            }

        } while (!fits);

        if (!tight) {
            maxCanvas.width = tileSize;
            maxCanvas.height = tileSize;
            let maxContext = getContext(maxCanvas);
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

    function claimCharacterAffinity(entityType: IEntityType, childIndex: number): string {
        // do we already have this affinity?
        let key = 'c_' + entityType.character;
        let affinities: string = localStorage.getItem(key);
        if (affinities) {
            let c = affinities.charAt(childIndex);
            if (c != ' ') {
                return c;
            }
        } else {
            affinities = '';
            for (let i = 0; i < entityTypeCount; i++) {
                affinities += ' ';
            }
        }
        let claimedCharactersKey = 'cc';
        let claimedCharacters = localStorage.getItem(claimedCharactersKey);
        let c = findBestUnclaimedCharacter(entityType.character, claimedCharacters, '');
        if (!c) {
            c = findAnyUnclaimedCharacter(claimedCharacters);
        }
        if (c) {
            affinities = affinities.substr(0, childIndex) + c + affinities.substr(childIndex + 1);
            localStorage.setItem(key, affinities);
            claimedCharacters += c;
            localStorage.setItem(claimedCharactersKey, claimedCharacters);
        }
        return c;
    }

    function findAnyUnclaimedCharacter(claimedCharacters: string) {
        for (let c in characterAffinities) {
            if (claimedCharacters.indexOf(c) < 0) {
                return c;
            }
        }
    }

    function findBestUnclaimedCharacter(to: string, claimedCharacters: string, checked: string): string {
        if (claimedCharacters.indexOf(to) >= 0) {
            let nowChecked = checked + to;
            let check = characterAffinities[to];
            if (check) {
                // randomize the order of the check (does not need to be repeatable because the result is stored explicitly?)
                let randomCheck = '';
                for (let i = 0; i < check.length; i++) {
                    let toIndex = floor(random() * randomCheck.length);
                    randomCheck = randomCheck.substr(0, toIndex) + check.charAt(i) + randomCheck.substr(toIndex);
                }

                let c: string;
                let index = 0;
                while (!c && index < randomCheck.length) {
                    let toCheck = randomCheck.charAt(index);
                    if (checked.indexOf(toCheck) < 0) {
                        c = findBestUnclaimedCharacter(toCheck, claimedCharacters, nowChecked);
                    }
                    index++;
                }
                return c;
            }
            // else return null
        } else {
            return to;
        }
    }

    function mutate(entityType: IEntityType, count: number, source: number): IEntityType {
        let result: IEntityType;
        if (count) {
            let childSeedAdjust = source & entityTypeMask;
            let rng = randomNumberGeneratorFactory(entityType.mutationSeed + childSeedAdjust);
            // TODO check/claim character affinity
            let mutatedCharacter = claimCharacterAffinity(entityType, childSeedAdjust);
            if (mutatedCharacter) {

                let speed: number;
                if (entityType.classification != CLASSIFICATION_WALL) {
                    if (entityType.sp) {
                        speed = entityType.sp + rng() * 0.0006;
                    } else {
                        speed = 0.001 + rng() * 0.002;
                    }
                }

                let mutatedMutationSeed = rng(maxInt);
                let mutatedEntityType: IEntityType = {
                    animations: entityType.animations,
                    bg: entityType.bg,
                    fg: mutateColor(rng, entityType.fg),
                    bold: entityType.bold,
                    outline: entityType.outline,
                    aggression: entityType.aggression + rng(),
                    character: mutatedCharacter,
                    mutationSeed: mutatedMutationSeed,
                    classification: entityType.classification,
                    collisionHandlers: [],
                    cowardliness: entityType.cowardliness * rng(),
                    dedication: (1 - (1 - entityType.dedication) * rng()),
                    distractibility: entityType.distractibility * rng(),
                    flipCost: max(1, entityType.flipCost - rng()),
                    tileCost: max(1, entityType.tileCost - rng()),
                    turnCost: max(1, entityType.turnCost - rng()),
                    visionRange: entityType.visionRange,
                    parent: entityType,
                    sp: speed,
                    hunger: entityType.hunger,
                    minDecisionTimeoutMillis: entityType.minDecisionTimeoutMillis,
                    observationTimeoutMillis: entityType.observationTimeoutMillis,
                    varianceDecisionTimeoutMillis: entityType.varianceDecisionTimeoutMillis
                }
                result = mutate(mutatedEntityType, count - 1, source >> entityTypeBits);
            } else {
                // we run out of mutations
                result = entityType;
            }

        } else {
            result = entityType;
        }
        return result;
    }

    return function (stateKey: ILevelPlayStateKey): IRecord<ILevelPlayState> {

        saveLocationFunction(stateKey.universe.seed, stateKey.x, stateKey.y);
        let z = loadDepthFunction(stateKey.x, stateKey.y);

        // work out the valid entities
        var levelSeed = stateKey.universe.seed + stateKey.x + stateKey.y * 9999;
        var levelRng = randomNumberGeneratorFactory(levelSeed);

        let entitySeed = stateKey.universe.seed + z + stateKey.y * 99 + stateKey.x * 9999;
        let entityRng = randomNumberGeneratorFactory(entitySeed);

        let classificationCounts: { [_: number]: number } = {};
        let totalCount = 0;
        for (let classification in classificationRanges) {
            let range = classificationRanges[classification];
            let entityTypes = stateKey.universe.entityTypes[classification];
            if (entityTypes) {
                let count = range.min + levelRng(range.max - range.min + 1);
                classificationCounts[classification] = count;
                if (_parseInt(classification) != CLASSIFICATION_WALL) {
                    totalCount += count;
                }
            }
        }

        let mutationCounts: { [_: number]: number } = {};
        let mutationRng = randomNumberGeneratorFactory(levelSeed);
        for (let i = 0; i < z; i++) {
            let index = mutationRng(totalCount);
            let mutationCount = mutationCounts[index];
            if (mutationCount) {
                mutationCount++;
            } else {
                mutationCount = 1;
            }
            mutationCounts[index] = mutationCount;
        }


        // do not allow every monster in every level

        let entityTypeCount = 0;
        let validEntityTypes: { [_: number]: IEntityType[] } = {};
        for (let classification in classificationRanges) {
            let entityTypes = stateKey.universe.entityTypes[classification];
            if (entityTypes) {
                let count = classificationCounts[classification];
                // mutate the entity type to the appropriate level
                let classificationEntityTypes: IEntityType[] = [];
                while (count > 0) {
                    count--;
                    let id = levelRng(maxInt);
                    let index = (id & entityTypeMask) % entityTypes.length;
                    id = id >> entityTypeBits;
                    let entityType = entityTypes[index];
                    let mutations = mutationCounts[entityTypeCount];
                    entityType = mutate(entityType, mutations, id);
                    classificationEntityTypes.push(entityType);
                    if (entityType.classification != CLASSIFICATION_WALL) {
                        entityTypeCount++;
                    }
                }
                validEntityTypes[classification] = classificationEntityTypes;
            }
        }


        // calculate the dimensions of the level
        var containerWidth = containerElement.clientWidth;
        var containerHeight = containerElement.clientHeight;
        var containerArea = containerWidth * containerHeight;
        var tileSize = floor(Math.sqrt(containerArea / minimumAreaTiles));
        var width = ceil(containerWidth / tileSize);
        if (width < minimumDimension) {
            width = minimumDimension;
            tileSize = ceil(containerWidth / width);
            height = containerHeight / tileSize;
        }
        var height = ceil(containerHeight / tileSize);
        if (height < minimumDimension) {
            height = minimumDimension;
            tileSize = ceil(containerHeight / height);
            width = ceil(containerWidth / tileSize);
        }

        let matrix = levelPlayMatrixCreate<ILevelPlayEntityDescription[]>(width, height, function () {
            return [];
        });

        if (canvasElement.width != containerWidth || canvasElement.height != containerHeight) {
            canvasElement.width = containerWidth;
            canvasElement.height = containerHeight;
        }

        let renderOffsetX = ceil((containerWidth - width * tileSize) / 2);
        let renderOffsetY = ceil((containerHeight - height * tileSize) / 2);
        let outlineWidth = max(1, tileSize / 24);

        for (let classification = CLASSIFICATION_MAX_INDEX; classification >= CLASSIFICATION_MIN_INDEX; classification--) {
            let classificationMatrixPopulators = matrixPopulators[classification];
            let classificationValidEntityTypes = validEntityTypes[classification];
            if (classificationMatrixPopulators && classificationValidEntityTypes) {
                var matrixPopulatorIndex = levelRng(classificationMatrixPopulators.length);
                var matrixPopulator = classificationMatrixPopulators[matrixPopulatorIndex];
                matrixPopulator(stateKey, matrix, classificationValidEntityTypes, z, entityRng);
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
                //case DIRECTION_SOUTH:
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
                    let playerMind = <ILevelPlayEntityMindPlayer>playerDescription.mind.v;
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

                    var entityType = description.t;

                    let padding: number;
                    if (entityType.bg != null) {
                        padding = 0;
                    } else {
                        padding = ceil(tileSize / 5);
                    }
                    let fitResult = fit(
                        entityType.character,
                        tileSize,
                        entityType.bg == null,
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

                    let render = newCanvas(entityWidth, entityHeight);
                    let renderContext = getContext(render);
                    renderContext.font = fitResult.font;
                    renderContext.textBaseline = 'top';

                    let foregroundColor: string | CanvasGradient;
                    if (entityType.fg.length > 1) {

                        //let gradient = renderContext.createLinearGradient(textWidth, 0, 0, textHeight);
                        let gx = textWidth * 0.8;
                        let gy = textHeight * 0.2;
                        let r = max(textWidth, textHeight) * 0.8;
                        let gradient = renderContext.createRadialGradient(gx, gy, r / 5, gx, gy, r);  
                        gradient.addColorStop(0, entityType.fg[entityType.fg.length - 1]);
                        gradient.addColorStop(1, entityType.fg[1]);
                        foregroundColor = gradient;
                    } else {
                        foregroundColor = entityType.fg[0];
                    }

                    let entity: ILevelPlayEntity = {
                        d: description,
                        x: tx * tileSize + (tileSize - textWidth) / 2,
                        y: ty * tileSize + (tileSize - textHeight) / 2,
                        w: entityWidth,
                        h: entityHeight,
                        o: ORIENTATION_FACING_RIGHT_FEET_DOWN,
                        r: 0,
                        offx: fitResult.textOffsetX,
                        offy: fitResult.textOffsetY,
                        font: fitResult.font,
                        renderMask: renderMask,
                        render: render,
                        renderContext: renderContext,
                        foregroundFill: foregroundColor,
                        vx: 0,
                        vy: 0,
                        anims: {},
                        state: ENTITY_STATE_IDLE
                    };
                    if (description.initialOrientation) {
                        levelPlayEntityRotateRenderMask(entity, ORIENTATION_FACING_RIGHT_FEET_DOWN, description.initialOrientation);
                        entity.o = description.initialOrientation;
                    }
                    entities.push(entity);
                    levelPlayEntityMatrixAdd(entityMatrix, tileSize, entity);
                }
            }
        }

        let previousCanvas = newCanvas(containerWidth, containerHeight);
        let previousContext = getContext(previousCanvas);
        previousContext.drawImage(canvasElement, 0, 0);
        
        let tween: ITween;
        if (stateKey.playerEntryPoint && !stateKey.suppressScroll) {
            tween = {
                durationMillis: 500,
                easing: {
                    t: EASING_QUADRATIC_OUT
                },
                effect: {
                    t: EFFECT_SLIDE_IN,
                    v: {
                        slideOutRenderer: recordContextEffectRenderCanvasFactory(previousCanvas),
                        d: stateKey.playerEntryPoint
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
            quantity: number, 
            baseVelocityX: number, 
            baseVelocityY: number
        ): ILevelPlayEntity[] {
            let results: ILevelPlayEntity[] = [];

            while (quantity) {
                quantity--;


                let angle = random() * -pi;
                let velocity = particleType.sp / 2 + particleType.sp * random();
                let velocityX = Math.cos(angle) * velocity;
                let velocityY = sin(angle) * velocity;

                let minColor = floor(colors.length / 2);
                let colorRange = colors.length - minColor + 1;
                let colorIndex = minColor + levelRng(colorRange);
                let color: string;
                if (colorIndex >= colors.length) {
                    color = COLOR_WHITE;
                } else {
                    color = colors[colorIndex];
                }

                let canvas = newCanvas(particleSize, particleSize);
                let context = getContext(canvas);
                context.fillStyle = color;
                context.fillRect(0, 0, particleSize, particleSize);

                let render = newCanvas(particleSize, particleSize);
                let renderContext = getContext(render);

                let particleMind: IRecord<LevelPlayEntityMind> = {
                    t: MIND_INERT
                };

                let animations: { [_: number]: ILevelPlayEntityAnimation } = {
                };

                let particle: ILevelPlayEntity = {
                    x: cx - particleSize / 2,
                    y: cy - particleSize / 2,
                    w: particleSize,
                    h: particleSize,
                    vx: velocityX + baseVelocityX,
                    vy: velocityY + baseVelocityY, 
                    render: render, 
                    renderContext: renderContext,
                    renderMask: canvas,
                    foregroundFill: color,
                    offx: particleSize / 2,
                    offy: particleSize / 2, 
                    d: {
                        t: particleType, 
                        mind: particleMind,
                        side: SIDE_NEUTRAL
                    },
                    o: ORIENTATION_FACING_RIGHT_FEET_DOWN, 
                    font: null,
                    r: 0,
                    state: ENTITY_STATE_DYING,
                    anims: animations, 
                    gravity: true                    
                };
                results.push(particle);
            }

            return results;
        }

        return {
            t: STATE_LEVEL_PLAY,
            v: {
                key: stateKey,
                z: z,
                renderOffsetX: renderOffsetX, 
                renderOffsetY: renderOffsetY,
                ow: outlineWidth,
                es: entities,
                matrix: entityMatrix,
                entityTypeDecisionCaches: {},
                width: width, 
                height: height,
                tileSize: tileSize,
                rng: entityRng,
                ageMillis: 0,
                tween: tween,
                levelName: toStringWithSign(stateKey.x) + toStringWithSign(stateKey.y) + toStringWithSign(z),
                levelFont: toFont(tileSize * 2, true, 'monospace'),
                levelColors: levelColors,
                levelBackground: levelBackground,
                particleFactory: particleFactory, 
                energy: 0
            }
        }
    }
}