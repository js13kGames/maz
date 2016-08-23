function levelPlayStartFactory(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): IStateStartFunction {

    function render(state: ILevelPlayState) {
        context.fillStyle = COLOR_BLACK;
        context.fillRect(0, 0, canvas.width, canvas.height);
        for (let entity of state.entities) {
            let renderContext = entity.renderContext;
            renderContext.clearRect(0, 0, entity.baseWidth, entity.baseHeight);

            renderContext.drawImage(entity.renderMask, 0, 0);
            renderContext.save();
            renderContext.globalCompositeOperation = 'source-in';
            let background = entity.type.backgroundColor;
            if (background) {
                renderContext.fillStyle = background;
            } else {
                renderContext.fillStyle = entity.type.foregroundColor;
            }
            renderContext.fillRect(0, 0, entity.baseWidth, entity.baseHeight);
            if (background) {
                renderContext.globalCompositeOperation = 'source-atop';
                renderContext.fillStyle = entity.type.foregroundColor;
                renderContext.fillText(entity.type.character, entity.offsetX, entity.offsetY);
            }
            renderContext.restore();
            context.drawImage(entity.render, entity.x, entity.y);
        }
    }

    return function (state: ILevelPlayState, nextStateCallback: IStateCompleteCallback): IRecord<ILevelPlayStateRunner> {
        canvas.removeAttribute('class');

        var animationCallback = function () {

            render(state);

            runner.animationFrameRequestId = requestAnimationFrame(animationCallback);
        };

        var animationFrameRequestId = requestAnimationFrame(animationCallback);

        var runner: ILevelPlayStateRunner = {
            animationFrameRequestId: animationFrameRequestId
        };


        return {
            type: STATE_LEVEL_PLAY,
            value: runner
        };
    }
}