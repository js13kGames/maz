function randomNumberGeneratorFactory(seed: number): IRandomNumberGenerator {

    return function (range?: number) {
        var x = sin(seed++) * 10000;
        var r = x - floor(x);
        if (range != null) {
            r = floor(r * range);
        }
        return r;
    }
}