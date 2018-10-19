const expect = require('expect.js');
const { makeTests, toArray } = require('./_suite');

makeTests('Integer', [{
    name: 'Invalid input: [null]',
    input: [null],
    exception: /Invalid input/,
}, {
    name: 'Invalid input: null',
    input: null,
    exception: /Invalid input/,
}, {
    name: 'Invalid input: undefined',
    input: undefined,
    exception: /Invalid input/,
}, {
    name: 'Invalid input: [undefined]',
    input: [undefined],
    exception: /Invalid input/,
}, {
    name: 'Invalid input: empty string',
    input: '',
    exception: /Invalid input/,
}, {
    name: 'Invalid input: [""]',
    input: [''],
    exception: /Invalid input/,
}, {
    name: 'Invalid input: {}',
    input: {},
    exception: /Invalid input/,
}, {
    name: 'Invalid input: [{}]',
    input: [{}],
    exception: /Invalid input/,
}, {
    name: 'Invalid input: NaN',
    input: NaN,
    exception: /Invalid input/,
}, {
    name: 'Invalid input: [NaN]',
    input: [NaN],
    exception: /Invalid input/,
}, {
    name: 'Invalid input: wrong range delimiter',
    input: ['1, 2, 5; 7-10'],
    exception: /Invalid input/,
}, {
    name: 'Invalid input: wrong type',
    input: ['1, 2, 5, foo'],
    exception: /Invalid input/,
}, {
    name: 'Empty input',
    input: [],
    stringify: '',
    size: 0,
}, {
    name: 'Single contiguous range',
    input: '-5..5',
    size: 11,
    stringify: '-5..5',
    contains: [{
        input: toArray('-5 -4 -3 -2 -1 0 1 2 3 4 5'),
        want: true,
        checkEach: true,
    }, {
        input: '-5..5',
        want: true,
    }, {
        input: ['-4..-2', 0, '1..3'],
        want: true,
    }, {
        input: toArray('-6 -5 -4 -3 -2'),
        want: false,
    }, {
        input: '-10..-3,1..8',
        want: false,
    }, {
        input: ['-5..-1', '3..6'],
        want: false,
    }, {
        input: '-6..6',
        want: false,
    }, {
        input: -6,
        want: false,
    }, {
        input: 6,
        want: false,
    }],
    containsAll: [{
        input: toArray('-10 -9 -8 -7 -6 -5 -4 -3 -2'),
        want: '-10..-6',
    }, {
        input: toArray('-5 -1 0 3'),
        want: '',
    }, {
        input: toArray('-5..5'),
        want: ''
    }, {
        input: '-10..10',
        want: '-10..-6,6..10',
    }],
    by: toArray('-5 -4 -3 -2 -1 0 1 2 3 4 5'),
}, {
    name: 'Multiple discontiguous ranges',
    input: ['-45..-42', '0, 1, 2, 5; 7..10, 15..20', 30, '40..50'],
    size: 30,
    stringify: '-45..-42,0..2,5,7..10,15..20,30,40..50',
    contains: [{
        input: toArray('-42 -45 0 1 2 5 7 8 9 10 15 16 17 18 19 20 30 40',
                       '41 42 43 44 45 46 47 48 49 50'),
        want: true,
        checkEach: true,
    }, {
        input: '2, 5, 16..19; 42..45',
        want: true,
    }, {
        input: ['0..2', 30, '40..50'],
        want: true,
    }, {
        input: toArray('-42 -45 0 1 2 3 4 5 6 7 8 9 10 15 16 17 18 19 20 30 40',
                       '41 42 43 44 45 46 47 48 49 50'),
        want: false,
    }, {
        input: -46,
        want: false,
    }, {
        input: 3,
        want: false,
    }],
    containsAll: [{
        input: toArray('-41 -46 3 4 6 11 12 13 14 21 22 23 24 25 26',
                       '27 28 29 31 32 33 34 35 36 37 38 39 -101'),
        want: '-101,-46,-41,3..4,6,11..14,21..29,31..39'
    }, {
        input: toArray('-42 -45 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16',
                       '17 18 19 20 30 40 41 42 43 44 45 46 47 48 49 50'),
        want: '3..4,6,11..14',
    }],
    by: toArray('-45 -44 -43 -42 0 1 2 5 7 8 9 10 15 16 17 18 19 20 30 40',
                '41 42 43 44 45 46 47 48 49 50'),
}, {
    name: 'collapsing input',
    input: '5,8,3,10,0,4,9,2,7,1,6',
    size: 11,
    stringify: '0..10',
    by: toArray('0 1 2 3 4 5 6 7 8 9 10'),
    contains: [{
        input: toArray('10 9 8 7 6 5 4 3 2 1'),
        want: true,
        checkEach: true,
    }, {
        input: '-1..121',
        want: false,
    }, {
        input: 11,
        want: false,
    }],
    containsAll: [{
        input: '0..10',
        want: '',
    }, {
        input: '-10..10',
        want: '-10..-1',
    }, {
        input: '-3..5',
        want: '-3..-1',
    }, {
        input: '7..15',
        want: '11..15',
    }]
}, {
    name: 'add',
    input: '-5..-4; -2, 0; 2; 4',
    method: 'add',
    methodInput: toArray('1 5 -1 -3 3'),
    size: 11,
    stringify: '-5..5',
    by: toArray('-5 -4 -3 -2 -1 0 1 2 3 4 5'),
}, {
    name: 'add outside on the left',
    input: '-5..5',
    method: 'add',
    methodInput: '-8..-7',
    size: 13,
    stringify: '-8..-7,-5..5',
    by: toArray('-8 -7 -5 -4 -3 -2 -1 0 1 2 3 4 5'),
}, {
    name: 'add outside on the right',
    input: '-5..5',
    method: 'add',
    methodInput: '8..7',
    size: 13,
    stringify: '-5..5,7..8',
    by: toArray('-5 -4 -3 -2 -1 0 1 2 3 4 5 7 8'),
}, {
    name: 'add adjacent on the left',
    input: '-5..-4,0..2',
    method: 'add',
    methodInput: '-1..1',
    size: 6,
    stringify: '-5..-4,-1..2',
    by: toArray('-5 -4 -1 0 1 2'),
}, {
    name: 'add adjacent on the right',
    input: '-5..-4,0..2',
    method: 'add',
    methodInput: '1..3',
    size: 6,
    stringify: '-5..-4,0..3',
    by: toArray('-5 -4 0 1 2 3'),
}, {
    name: 'add in the center',
    input: '-5..-4,0..1,4..5',
    method: 'add',
    methodInput: '-1..2',
    size: 8,
    stringify: '-5..-4,-1..2,4..5',
    by: toArray('-5 -4 -1 0 1 2 4 5'),
}, {
    name: 'add overlap two ranges',
    input: '-5..-4,-2..-1,1..2,4..5',
    method: 'add',
    methodInput: '-2..2',
    size: 9,
    stringify: '-5..-4,-2..2,4..5',
    by: toArray('-5 -4 -2 -1 0 1 2 4 5'),
}, {
    name: 'add overlap/intersect two ranges on the left',
    input: '-5..-4,-1..0,1..2,4..5',
    method: 'add',
    methodInput: '-2..2',
    size: 9,
    stringify: '-5..-4,-2..2,4..5',
    by: toArray('-5 -4 -2 -1 0 1 2 4 5'),
}, {
    name: 'add overlap/intersect two ranges on the right',
    input: '-5..-4,-2..0,2..3,6..8',
    method: 'add',
    methodInput: '-1..4',
    size: 12,
    stringify: '-5..-4,-2..4,6..8',
    by: toArray('-5 -4 -2 -1 0 1 2 3 4 6 7 8'),
}, {
    name: 'add collapsing two nearby ranges',
    input: '-7..-6,-4..-3,2..3,5..6',
    method: 'add',
    methodInput: '0, -2, 1, 2, -1',
    size: 12,
    stringify: '-7..-6,-4..3,5..6',
    by: toArray('-7 -6 -4 -3 -2 -1 0 1 2 3 5 6'),
}, {
    name: 'multiple add() calls',
    input: [],
    method: (range) => {
        range.add(toArray('-3 0 2 5'));
        
        expect(range + '').to.be('-3,0,2,5');
        expect(range.size).to.be(4);
        
        range.add(toArray('-5 4 -1'));
        
        expect(range + '').to.be('-5,-3,-1..0,2,4..5');
        expect(range.size).to.be(7);
        
        range.add(toArray('-2 3 -4'));
        
        expect(range + '').to.be('-5..0,2..5');
        expect(range.size).to.be(10);
        
        range.add(1);
    },
    methodInput: [],
    size: 11,
    stringify: '-5..5',
}, {
    name: 'add a RangeSet',
    input: '-5..5',
    method: (range1, input) => {
        const range2 = new range1.constructor(range1.Range, input);
        
        range1.add(range2);
    },
    methodInput: '-10..10',
    size: 21,
    stringify: '-10..10',
    by: toArray('-10 -9 -8 -7 -6 -5 -4 -3 -2 -1 0 1 2 3 4 5 6 7 8 9 10'),
}, {
    name: 'remove disjointed range',
    input: '-5..5',
    method: 'remove',
    methodInput: '10..20',
    size: 11,
    stringify: '-5..5',
}, {
    name: 'remove an equal range',
    input: '-5..5',
    method: 'remove',
    methodInput: '-5..5',
    size: 0,
    stringify: '',
}, {
    name: 'remove a range that includes us',
    input: '-5..5',
    method: 'remove',
    methodInput: '-10..10',
    size: 0,
    stringify: '',
}, {
    name: 'remove contained range from center',
    input: ['-5..5'],
    method: 'remove',
    methodInput: '-3..3',
    size: 4,
    stringify: '-5..-4,4..5',
}, {
    name: 'remove contained range on the left edge',
    input: '-5..5',
    method: 'remove',
    methodInput: '-5..-3',
    size: 8,
    stringify: '-2..5',
}, {
    name: 'remove contained range on the right edge',
    input: '-5..5',
    method: 'remove',
    methodInput: '2..5',
    size: 7,
    stringify: '-5..1',
}, {
    name: 'remove overlapping range on the left edge',
    input: '-5..5',
    method: 'remove',
    methodInput: '-10..-3',
    size: 8,
    stringify: '-2..5',
}, {
    name: 'remove overlapping range on the right edge',
    input: '-5..5',
    method: 'remove',
    methodInput: '2..10',
    size: 7,
    stringify: '-5..1',
}, {
    name: 'remove adjacent on the left edge',
    input: '-5..5',
    method: 'remove',
    methodInput: '-10..-6',
    size: 11,
    stringify: '-5..5',
}, {
    name: 'remove adjacent on the left edge, two ranges',
    input: '1..5, 7..9',
    method: 'remove',
    methodInput: '-6..6',
    size: 3,
    stringify: '7..9',
}, {
    name: 'remove adjacent on the right edge',
    input: '-5..5',
    method: 'remove',
    methodInput: '10..6',
    size: 11,
    stringify: '-5..5',
}, {
    name: 'remove adjacent on the right edge, two ranges',
    input: '1..5, 7..9',
    method: 'remove',
    methodInput: '6..10',
    size: 5,
    stringify: '1..5',
}, {
    name: 'remove overlapping multiple ranges',
    input: '-5..5, 10..15, 20..24, 26..30, 42..46; 50..60',
    method: 'remove',
    methodInput: '0..55',
    size: 10,
    stringify: '-5..-1,56..60',
}, {
    name: 'remove overlapping and adjacent on left edge',
    input: '-5..5, 10..15, 20..30',
    method: 'remove',
    methodInput: '6..28',
    size: 13,
    stringify: '-5..5,29..30',
}, {
    name: 'remove overlapping and ajacent on right edge',
    input: '-5..5, 10..15, 20..30',
    method: 'remove',
    methodInput: '-10..19',
    size: 11,
    stringify: '20..30',
}, {
    name: 'remove within multiple ranges',
    input: '-5..5, 10..15, 20..30',
    method: 'remove',
    methodInput: '-3..3,11..14,22..28',
    stringify: '-5..-4,4..5,10,15,20..21,29..30',
    size: 10,
}, {
    name: 'remove collapsed from within',
    input: '-5..5, 10..15',
    method: 'remove',
    methodInput: '12',
    stringify: '-5..5,10..11,13..15',
    size: 16,
}, {
    name: 'remove collapsed on the left edge',
    input: '-5..5, 10..15',
    method: 'remove',
    methodInput: '10',
    stringify: '-5..5,11..15',
    size: 16,
}, {
    name: 'remove collapsed on the right edge',
    input: '-5..5, 10..15',
    method: 'remove',
    methodInput: '5',
    stringify: '-5..4,10..15',
    size: 16,
}, {
    name: 'remove a point on both edges',
    input: '-5..5, 10..15',
    method: 'remove',
    methodInput: [5, 10],
    stringify: '-5..4,11..15',
    size: 15,
}, {
    name: 'multiple remove() calls',
    input: '-5..5',
    method: (range) => {
        range.remove(1);
        
        expect(range + '').to.be('-5..0,2..5');
        expect(range.size).to.be(10);
        
        range.remove(toArray('-2 3 -4'));
        
        expect(range + '').to.be('-5,-3,-1..0,2,4..5');
        expect(range.size).to.be(7);
        
        range.remove(toArray('-5 4 -1'));
        
        expect(range + '').to.be('-3,0,2,5');
        expect(range.size).to.be(4);
        
        range.remove(toArray('-3 0 2 5'));
        
        expect(range + '').to.be('');
        expect(range.size).to.be(0);
    },
    methodInput: [],
}, {
    name: 'complex operations',
    input: ['0, 1, 2, 5; 7..10, 15..20', 30, '50..40', '-42..-45'],
    method: (object) => {
        debugger;
        object.add(['101;105..107', 110, '115..118', '-46..-42', '19..16']);
        object.remove('10..100');
    },
    contains: [{
        input: toArray('-42 -46 0 1 2 5 7 8 9 101 105 106 107 110 115 116 117 118'),
        want: true,
        checkEach: true,
    }, {
        input: toArray('15 16 17 18 19 20 30 40 41 42 43 44 45 46 47 48'),
        want: false,
        checkEach: true,
    }, {
        input: '105..107',
        want: true,
    }, {
        input: '100',
        want: false,
    }],
    size: 21,
    stringify: '-46..-42,0..2,5,7..9,101,105..107,110,115..118',
}]);
