const { makeTests } = require('./_suite');

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
    name: 'Single contiguous range: 0010-0100',
    input: '0010..0100',
    size: 91,
    stringify: '0010-0100',
}]);