function mutateColor(rng: IRandomNumberGenerator, colors: string[]): string[] {
    let index = rng(3) + 1;
    let delta = rng(5) - 2;
    let result: string[] = [];
    for (let color of colors) {
        let hex = color.charAt(index);
        let hexIndex = _ranges.indexOf(hex);
        hexIndex = max(0, min(_ranges.length - 1, hexIndex + delta));
        let newHex = _ranges.charAt(hexIndex);
        result.push(color.substr(0, index) + newHex + color.substr(index+1));
    }
    return result;
}