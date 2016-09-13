let localStorageSaveLocationFunction: IStorageSaveLocationFunction = function (universeSeed: number, x: number, y: number) {
    localStorage.setItem(UNIVERSE_KEY, universeSeed + ',' + x + ',' + y);
}