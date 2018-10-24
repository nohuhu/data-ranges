const { makeTests, toArray } = require('./_suite');

makeTests('Serial', [{
    name: 'Invalid input: -1',
    input: [-1],
    exception: /Invalid input/,
}, {
    name: 'Invalid input: "-5..5"',
    input: "-5..5",
    exception: /Invalid input/,
}, {
    name: 'Single contiguous range',
    input: '0-9',
    size: 10,
    stringify: '0-9',
    contains: [{
        input: toArray('0 1 2 3 4 5 6 7 8 9'),
        want: true,
        checkEach: true,
    }, {
        input: '10',
        want: false,
    }],
    by: toArray('0 1 2 3 4 5 6 7 8 9'),
}, {
    name: 'Multiple discontiguous ranges',
    input: { values: '1-10, 20-30, 40-50', separator: '; ', },
    size: 32,
    stringify: '1-10; 20-30; 40-50',
    contains: [{
        input: toArray('1 2 3 4 5 6 7 8 9 10',
                       '21 22 23 24 25 26 27 28 29 30',
                       '41 42 43 44 45 46 47 48 49 50'),
        want: true,
        checkEach: true,
    }, {
        input: '0,11-19; 31-39,51',
        want: false,
        checkEach: true,
    }],
    containsAll: [{
        input: '0-60',
        want: '0; 11-19; 31-39; 51-60',
    }],
    by: toArray('1 2 3 4 5 6 7 8 9 10',
                '20 21 22 23 24 25 26 27 28 29 30',
                '40 41 42 43 44 45 46 47 48 49 50'),
}]);
