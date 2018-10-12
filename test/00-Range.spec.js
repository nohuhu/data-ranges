const expect = require('expect.js');

describe("base Range", function() {
    let Range;
    
    it("should compile", function() {
        expect(function() {
            Range = require('../src/Range');
        })
        .to.not.throwException();
    });
    
    it("should export Range constructor", function() {
        expect(typeof Range).to.be('function');
    });
    
    it("should have static create() method", function() {
        expect(typeof Range.create).to.be('function');
    });
});
