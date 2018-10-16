const expect = require('expect.js');
const { makeTests, toArray } = require('./makeSuite');

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
        input: ['-4..-2', '1..3'],
        want: true,
    }, {
        input: toArray('-6 -5 -4 -3 -2'),
        want: false,
    }, {
        input: ['-5..-1', '3..6'],
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
        want: toArray('-10 -9 -8 -7 -6'),
    }, {
        input: toArray('-5 -1 0 3'),
        want: [],
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
        input: toArray('-42 -45 0 1 2 3 5 7 8 9 10 15 16 17 18 19 20 30 40',
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
        want: toArray('-41 -46 3 4 6 11 12 13 14 21 22 23 24 25 26',
                      '27 28 29 31 32 33 34 35 36 37 38 39 -101'),
    }, {
        input: toArray('-42 -45 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16',
                       '17 18 19 20 30 40 41 42 43 44 45 46 47 48 49 50'),
        want: toArray('3 4 6 11 12 13 14'),
    }],
    by: toArray('-45 -44 -43 -42 0 1 2 5 7 8 9 10 15 16 17 18 19 20 30 40',
                '41 42 43 44 45 46 47 48 49 50'),
}, {
    name: 'add()',
    input: ['-5..-4; -2, 0; 2; 4'],
    method: 'add',
    methodInput: toArray('1 5 -1 -3 3'),
    size: 11,
    stringify: '-5..5',
}, {
    name: 'multiple add() calls',
    input: [],
    method: (object) => {
        object.add(toArray('-3 0 2 5'));
        
        expect(object + '').to.be('-3,0,2,5');
        expect(object.size).to.be(4);
        
        object.add(toArray('-5 4 -1'));
        
        expect(object + '').to.be('-5,-3,-1..0,2,4..5');
        expect(object.size).to.be(7);
        
        object.add(toArray('-2 3 -4'));
        
        expect(object + '').to.be('-5..0,2..5');
        expect(object.size).to.be(10);
        
        object.add(1);
    },
    methodInput: [],
    size: 11,
    stringify: '-5..5',
}, {
    name: 'remove()',
    input: ['-5..5'],
    method: 'remove',
    methodInput: '-3..3',
    size: 4,
    stringify: '-5..-4,4..5',
}, {
    name: 'multiple remove() calls',
    input: '-5..5',
    method: (object) => {
        object.remove(1);
        
        expect(object + '').to.be('-5..0,2..5');
        expect(object.size).to.be(10);
        
        object.remove(toArray('-2 3 -4'));
        
        expect(object + '').to.be('-5,-3,-1..0,2,4..5');
        expect(object.size).to.be(7);
        
        debugger;
        object.remove(toArray('-5 4 -1'));
        
        expect(object + '').to.be('-3,0,2,5');
        expect(object.size).to.be(4);
        
        object.remove(toArray('-3 0 2 5'));
        
        expect(object + '').to.be('');
        expect(object.size).to.be(0);
    },
    methodInput: [],
// }, {
//     
//     name: 'Valid input: one range',
//     input: ['-100..100'],
//     
//     
//     valid: [
//         '-100..-20', '0, 1, 2, 5; 7..10, 15..20', 30, '40..50',
//     ],
//     
//     'new': {
//         input: ['0, 1, 2, 5; 7..10, 15..20', 30, '40..50', '-42..-45'],
//         
//         has_list: toArray('-42 -45 0 1 2 5 7 8 9 10 15 16 17 18 19 20 30 40',
//                           '41 42 43 44 45 46 47 48 49 50'),
//         
//         has_in: toArray('-41 -46 3 4 6 11 12 13 14 21 22 23 24 25 26',
//                         '27 28 29 31 32 33 34 35 36 37 38 39 -101'),
//         
//         has_out: toArray('-41 -46 3 4 6 11 12 13 14 21 22 23 24 25 26',
//                          '27 28 29 31 32 33 34 35 36 37 38 39 -101'),
//     
//         valueOf: toArray('-45 -44 -43 -42 0 1 2 5 7 8 9 10 15 16 17 18 19',
//                          '20 30 40 41 42 43 44 45 46 47 48 49 50'),
//         
//         toString: '-45,-44,-43,-42,0,1,2,5,7,8,9,10,15,16,17,18,19,20,30,40,' +
//                       '41,42,43,44,45,46,47,48,49,50',
//         
//         collapsed: '-45..-42,0..2,5,7..10,15..20,30,40..50',
//         
//         size: 30,
//     },
//     
//     add: {
//         input: [ '101;105..107', 110, '115..118', '-46..-42', '19..16', ],
//         
//         has_list: toArray('-42 -46 0 1 2 5 7 8 9 10 15 16 17 18 19 20 30 40 41',
//                           '42 43 44 45 46 47 48 49 50 101 105 106 107',
//                           '110 115 116 117 118'),
//         
//         has_in: toArray('0 1 2 3 4 6 11 12 13 14 21 22 23 24 25 26 -41 -47',
//                         '27 28 29 31 32 33 34 35 36 37 38 39 51 52 53 10 15',
//                         '54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 20 30',
//                         '69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 40 41',
//                         '84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 -42 -43',
//                         '99 100 102 103 104 108 109 111 112 113 114 119'),
//         
//         has_out: toArray('3 4 6 11 12 13 14 21 22 23 24 25 26 -41 -47',
//                         '27 28 29 31 32 33 34 35 36 37 38 39 51 52 53',
//                         '54 55 56 57 58 59 60 61 62 63 64 65 66 67 68',
//                         '69 70 71 72 73 74 75 76 77 78 79 80 81 82 83',
//                         '84 85 86 87 88 89 90 91 92 93 94 95 96 97 98',
//                         '99 100 102 103 104 108 109 111 112 113 114 119'),
//         
//         valueOf: toArray('-46 -45 -44 -43 -42 0 1 2 5 7 8 9 10 15 16 17 18',
//                          '19 20 30 40 41 42 43 44 45 46 47 48 49 50 101 105',
//                          '106 107 110 115 116 117 118'),
//         
//         toString:
//             '-46,-45,-44,-43,-42,0,1,2,5,7,8,9,10,15,16,17,18,19,20,30,40,' +
//             '41,42,43,44,45,46,47,48,49,50,101,105,106,107,' +
//             '110,115,116,117,118',
//         
//         collapsed: '-46..-42,0..2,5,7..10,15..20,30,40..50,101,105..107,110,115..118',
//         
//         size: 40,
//     },
//     
//     remove: {
//         input: [ '10..100' ],
//         
//         has_list: toArray('-42 -46 0 1 2 5 7 8 9 101 105 106 107 110 115 116 117 118'),
//         
//         has_in: toArray('0 1 2 3 4 6 10 11 12 13 14 15 16 17 18 19 20 21 22 -41',
//                         '23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 10 16',
//                         '39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 17 18',
//                         '55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 20 30',
//                         '71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 -42 -43',
//                         '87 88 89 90 91 92 93 94 95 96 97 98 99 100 102 -8',
//                         '103 104 108 109 111 112 113 114 119 -47'),
//         
//         has_out: toArray('3 4 6 10 11 12 13 14 15 16 17 18 19 20 21 22 -41',
//                          '23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38',
//                          '39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54',
//                          '55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70',
//                          '71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86',
//                          '87 88 89 90 91 92 93 94 95 96 97 98 99 100 102 -8',
//                          '103 104 108 109 111 112 113 114 119 -47'),
//         
//         valueOf: toArray('-46 -45 -44 -43 -42 0 1 2 5 7 8 9 101 105 106 107 110',
//                          '115 116 117 118'),
//         
//         toString: '-46,-45,-44,-43,-42,0,1,2,5,7,8,9,101,105,106,107,110,115,116,117,118',
//         
//         collapsed: '-46..-42,0..2,5,7..9,101,105..107,110,115..118',
//         
//         size: 21,
//     }
}]);
