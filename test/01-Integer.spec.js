const tests = [{
    type: 'integer',
    
    invalid: [
        '1, 2, 5; 7-10; foo', '42..bar', null, undefined, '', {}, NaN
    ],
    
    valid: [
        '-100..-20', '0, 1, 2, 5; 7..10, 15..20', 30, '40..50',
    ],
    
    'new': {
        input: [
            '0, 1, 2, 5; 7..10, 15..20', 30, '40..50', '-42..-45',
        ],
        
        in_list: ('-42 -45 0 1 2 5 7 8 9 10 15 16 17 18 19 20 30 40 ' +
                 '41 42 43 44 45 46 47 48 49 50').split(' ').map(i => parseInt(i)),
        
        not_in_input: '-41 -46 3 4 6 11 12 13 14 21 22 23 24 25 26 ' +
                      '27 28 29 31 32 33 34 35 36 37 38 39'.split(' ').map(i => parseInt(i)),
        
        not_in_output: '-40 -101 3 4 6 11 12 13 14 21 22 23 24 25 26 ' +
                       '27 28 29 31 32 33 34 35 36 37 38 39'.split(' ').map(i => parseInt(i)),
    
        range_array: ('0 1 2 5 7 8 9 10 15 16 17 18 19 20 30 40 41 ' +
                      '42 43 44 45 46 47 48 49 50').split(' '),
        
        range_string: '0,1,2,5,7,8,9,10,15,16,17,18,19,20,30,40,' +
                      '41,42,43,44,45,46,47,48,49,50',
        
        collapsed_array: [
            { start: 0,  end: 2,  count: 3  }, 5,
            { start: 7,  end: 10, count: 4  },
            { start: 15, end: 20, count: 6  }, 30,
            { start: 40, end: 50, count: 11 }, 
        ],
        
        collapsed_string: '0-2,5,7-10,15-20,30,40-50',
        
        size: 30,
    },
}];

const makeSuite = require('./makeSuite');
const IntegerRange = require('../src/Integer');

describe("Integer ranges", function() {
    tests.forEach(test => makeSuite(test.type, test, IntegerRange));
});
