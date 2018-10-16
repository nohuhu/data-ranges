const expect = require('expect.js');

describe("base Range", function() {
    let Range;
    
    it("should compile", function() {
        expect(function() {
            Range = require('../src/range/Base');
        })
        .to.not.throwException();
    });
    
    it("should export Range constructor", function() {
        expect(typeof Range).to.be('function');
    });
    
    it("should be able to construct", function() {
        expect(function() {
            let object = new Range(0);
        })
        .to.not.throwException();
    });
    
    it("should be able to clone itself", function() {
        const object = new Range([0, 42]);
        const clone = object.clone();
        
        expect(clone).to.not.be(object);
        expect(clone.start.value).to.be(object.start.value);
        expect(clone.end.value).to.be(object.end.value);
    });
});
