function levelPlayEntityMatrixRemove(matrix: ILevelPlayMatrix<ILevelPlayEntity[]>, tileSize: number, entity: ILevelPlayEntity) {
    levelPlayMatrixIterate(matrix, tileSize, entity, function (a: ILevelPlayEntity[]) {
        arrayRemove(a, entity);
        return a;
    });
}