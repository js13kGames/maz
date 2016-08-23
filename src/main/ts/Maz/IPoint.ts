var POINT_DIRECTIONS_CARDINAL = [
    {
        x: 0,
        y: -1
    }, {
        x: -1,
        y: 0
    }, {
        x: 1,
        y: 0
    }, {
        x: 0,
        y: 1
    }
];
var POINT_DIRECTIONS_ALL = [
    {
        x: -1,
        y: -1
    }, {
        x: 0,
        y: -1
    }, {
        x: 1,
        y: -1
    }, {
        x: -1,
        y: 0
    }, {
        x: 1,
        y: 0
    }, {
        x: -1,
        y: 1
    }, {
        x: 0,
        y: 1
    }, {
        x: 1,
        y: 1
    }
];

interface IPoint {
    x: number;
    y: number;
}