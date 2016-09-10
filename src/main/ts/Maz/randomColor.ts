let _ranges = ['0000', '0123', '4567', '89AB', 'CDEF'];
let _combinations = [0x1, 0x2, 0x3, 0x4, 0x5, 0x6]

function randomColor(rng: IRandomNumberGenerator): string[] {
    let combinationIndex = rng(_combinations.length);
    let combination = _combinations[combinationIndex];
    let brightIndex = rng(_ranges[0].length);
    let dimIndex = rng(_ranges[0].length);
    let result: string[] = [];
    for (let i = 0; i < _ranges.length - 1; i++) {
        let bright = _ranges[i + 1].charAt(brightIndex);
        let dim = _ranges[0].charAt(dimIndex);
        let color = '#';
        let count = 3;
        let tempCombination = combination;
        while (count) {
            count--;
            let c = '#';
            if (tempCombination & 0x1) {
                c = bright;
            } else {
                c = dim;
            }
            color += c;
            tempCombination = tempCombination >> 1;
        }
        result.push(color);
    }
    return result;
}

