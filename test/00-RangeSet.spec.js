describe("RangeSet", function() {
    let RangeSet;
    
    it("should compile", function() {
        expect(function() {
            RangeSet = require('../src/RangeSet');
        })
        .not.toThrow();
    });
    
    it("should export RangeSet constructor", function() {
        expect(typeof RangeSet).toBe('function');
    });
});
