const { makeTests } = require('./_suite');
const _fill = require('fill-range');

const fill = (start, end) => {
    const startPrefixMatch = /^([#*])/.exec(start);
    const endPrefixMatch = /^([#*])/.exec(end);
    
    if (!!startPrefixMatch != !!endPrefixMatch) {
        throw new Error("Invalid range");
    }
    
    let result;
    
    if (!startPrefixMatch) {
        result = _fill(start, end);
    }
    else {
        const startPrefix = startPrefixMatch[0];
        const endPrefix = endPrefixMatch[0];
        
        if (startPrefix !== endPrefix) {
            throw new Error("Invalid range");
        }
        
        result = _fill(start.replace(startPrefix, ''), end.replace(endPrefix, ''))
                      .map(d => startPrefix + d);
    }
    
    if (!result.length) {
        throw new Error("Empty result array!");
    }
    
    return result;
};

makeTests('DigitString', [{
    name: 'Invalid input: 00*00',
    input: '00*00',
    exception: /Invalid input/,
}, {
    name: 'Invalid input: 12345678901234567',
    input: '12345678901234567',
    exception: /Invalid input/,
}, {
    name: 'Invalid input: ""',
    input: '',
    exception: /Invalid input/,
}, {
    name: 'Invalid input: &9999',
    input: '&9999',
    exception: /Invalid input/,
}, {
    name: 'Invalid input: foo',
    input: 'foo',
    exception: /Invalid input/,
}, {
    name: 'Invalid input: %123',
    input: '%123',
    exception: /Invalid input/,
}, {
    name: 'Single contiguous range no prefix: 0010-0100',
    input: '0010..0100',
    size: 91,
    stringify: '0010-0100',
    contains: [{
        input: fill('0010', '0100'),
        want: true,
        checkEach: true,
    }, {
        input: [].concat(fill('0000', '0009'), fill('000010', '00100')),
        want: false,
        checkEach: true,
    }],
    containsAll: [{
        input: fill('0000', '0020'),
        want: '0000-0009',
    }, {
        input: '0050-0150',
        want: '0101-0150',
    }],
    by: fill('0010', '0100'),
}, {
    name: 'Single contiguous range with prefix: *010-*100',
    input: '*010..*100',
    size: 91,
    stringify: '*010-*100',
    contains: [{
        input: fill('*010', '*100'),
        want: true,
        checkEach: true,
    }, {
        input: [].concat(fill('*000', '*009'), fill('0010', '0100'), fill('#010', '#100')),
        want: false,
        checkEach: true,
    }],
    containsAll: [{
        input: fill('*000', '*020'),
        want: '*000-*009',
    }, {
        input: '*050-*150',
        want: '*101-*150',
    }, {
        input: '0000-0150,#000-#150,*000-*150',
        want: '*000-*009,*101-*150,#000-#150,0000-0150',
    }],
    by: fill('*010', '*100'),
}, {
    name: 'Multiple disjointed ranges',
    input: ['0010..0100', '#010..#100', '*010-*100'],
    size: 91 * 3,
    stringify: '*010-*100,#010-#100,0010-0100',
    contains: [{
        input: [].concat(fill('0010', '0100'), fill('#010', '#100'), fill('*010', '*100')),
        want: true,
        checkEach: true,
    }, {
        input: fill('010', '100'),
        want: false,
        checkEach: true,
    }],
    containsAll: [{
        input: ['0010..0100', '#010..#100', '*010-*100'],
        want: '',
    }, {
        input: '0000-0150, #000-#150, *000-*150',
        want: '*000-*009,*101-*150,#000-#009,#101-#150,0000-0009,0101-0150',
    }, {
        input: '000-150, #0000-#0150, *0000-*0150',
        want: '*0000-*0150,#0000-#0150,000-150',
    }],
    by: [].concat(fill('*010', '*100'), fill('#010', '#100'), fill('0010', '0100')),
}, {
    name: 'Mixed collapsed and disjointed ranges',
    input: [ '*00', '#00', '0000-0010', '1234', '157863', '*0123', '#9999' ],
    size: 17,
    stringify: '*00,*0123,#00,#9999,0000-0010,1234,157863',
    contains: [{
        input: [].concat('*00', '#00', fill('0000', '0010'), '*0123', '#9999'),
        want: true,
        checkEach: true,
    }, {
        input: ['*01', '#02', '0011', '*1234', '157862', '#0123', '*9999', '157864'],
        want: false,
        checkEach: true,
    }],
    containsAll: [{
        input: '*0,#0,*00-*02,#00-#02,0000-0020,4321,1230-1235,*0120-*0125',
        want: '*0,*01-*02,*0120-*0122,*0124-*0125,#0,#01-#02,0011-0020,1230-1233,1235,4321',
    }],
    by: ['*00', '*0123', '#00', '#9999', ...fill('0000', '0010'), '1234', '157863'],
}, {
    name: 'add method',
    input: [ '*00', '#00', '0000-0010', '1234', '157863', '*0123', '#9999' ],
    method: 'add',
    methodInput: '#01-#03,*1000..*1003',
    size: 24,
    stringify: '*00,*0123,*1000-*1003,#00-#03,#9999,0000-0010,1234,157863',
    by: ['*00', '*0123', ...fill('*1000', '*1003'), ...fill('#00', '#03'), '#9999',
         ...fill('0000', '0010'), '1234', '157863'],
}, {
    name: 'Compound add/remove',
    input: [ '*00', '#00', '0000-0010', '1234', '157863', '*0123', '#9999' ],
    method: (object) => {
        object.add('#01-#03,*1000..*1003');
        object.remove(['#00-#02', '0001-0007', '157863']);
    },
    size: 13,
    stringify: '*00,*0123,*1000-*1003,#03,#9999,0000,0008-0010,1234',
    contains: [{
        input: [
            '#03', '#9999', '*00', '*0123', ...fill('*1000', '*1003'), '0000',
            '0008', '0009', '0010', '1234',
        ],
        want: true,
        checkEach: true,
    }, {
        input: [
            '*01', '*02', '0011', '*1234', '157862', '#0123', '*9999',
            '#00', '#01', '#02', ...fill('0001', '0007'), '157863'
        ],
        want: false,
        checkEach: true,
    }],
    containsAll: [{
        input: [
            '*01', '*02', '0011', '*1234', '157862', '#0123', '*9999',
            '#00', '#01', '#02', ...fill('0001', '0007'), '157863'
        ],
        want: '*01-*02,*1234,*9999,#00-#02,#0123,0001-0007,0011,157862-157863',
    }],
    by: [
        '*00', '*0123', ...fill('*1000', '*1003'), '#03', '#9999', '0000',
        ...fill('0008', '0010'), '1234',
    ],
}]);
