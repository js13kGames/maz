let _ranges = '0123456789ABCDEF';
let _combinations = [0x1, 0x2, 0x3, 0x4, 0x5, 0x6]

function randomColor(rng: IRandomNumberGenerator, versions: number): string[] {
    let combinationIndex = rng(_combinations.length);
    let combination = _combinations[combinationIndex];
    let highCount = 0;
    let tempCombination = combination;
    while (tempCombination) {
        if (tempCombination & 0x1) {
            highCount++;
        }
        tempCombination = tempCombination >> 1;
    }

    let sectionSize = floor(_ranges.length / versions);

    let brightDelta = rng(sectionSize + highCount * 3 - 3);
    let dimDelta = rng(sectionSize) - sectionSize - highCount + 2;
    let result: string[] = [];
    for (let i = 0; i < versions; i++) {
        let index = floor((i * _ranges.length) / versions);
        let brightIndex = max(0, min(index + brightDelta, _ranges.length-1));
        let dimIndex = max(0, min(index + dimDelta, _ranges.length-1));
        let bright = _ranges.charAt(brightIndex);
        let dim = _ranges.charAt(dimIndex);
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

