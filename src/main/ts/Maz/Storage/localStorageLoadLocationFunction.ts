let UNIVERSE_KEY = 'u';

let localStorageLoadLocationFunction: IStorageLoadLocationFunction = function () {
    let location = localStorage.getItem(UNIVERSE_KEY);
    if (location) {
        let parts = location.split(',');
        let existingUniverseSeed = _parseInt(parts[0]);
        let x = _parseInt(parts[1]);
        let y = _parseInt(parts[2]);
        return {
            universeSeed: existingUniverseSeed, 
            x: x, 
            y: y
        };
    }

}