function levelPlayEntityMatrixAdd(matrix: ILevelPlayMatrix<ILevelPlayEntity[]>, tileSize: number, entity: ILevelPlayEntity) {
    levelPlayMatrixIterate(matrix, tileSize, entity, function (a: ILevelPlayEntity[]) {
        a.push(entity);
        return a;
    });
}