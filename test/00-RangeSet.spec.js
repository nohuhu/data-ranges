const expect = require('expect.js');

describe("RangeSet", function() {
    let RangeSet;
    
    it("should compile", function() {
        expect(function() {
            RangeSet = require('../src/RangeSet');
        })
        .to.not.throwException();
    });
    
    it("should export RangeSet constructor", function() {
        expect(typeof RangeSet).to.be('function');
    });
});
