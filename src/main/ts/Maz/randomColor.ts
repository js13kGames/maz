let _brightRange = 'BCDEF';
let _midRange    = '6789A';
let _dimRange    = '12345';
let _combinations = [0x1, 0x2, 0x3, 0x4, 0x5, 0x6]

function randomColor(rng: IRandomNumberGenerator, isDim?:boolean) {
    let combinationIndex = rng(_combinations.length);
    let combination = _combinations[combinationIndex];
    let brightIndex = rng(_brightRange.length);
    let dimIndex = rng(_dimRange.length);
    let bright: string;
    let dim: string; 
    if (!isDim) {
        bright = _brightRange.charAt(brightIndex);
        dim = _midRange.charAt(dimIndex);
    } else {
        bright = _midRange.charAt(brightIndex);
        dim = _dimRange.charAt(dimIndex);
    }
    let result = '#';
    let count = 3;
    while (count) {
        count--;
        let c: string;
        if (combination & 0x1) {
            c = bright;
        } else {
            c = dim;
        }
        result += c;
        combination = combination >> 1;
    }
    return result;
}

