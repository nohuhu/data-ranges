const expect = require('expect.js');
const Range = require('../src/Range');

module.exports = function makeSuite(type, def, ctor) {
    describe(`type: ${type}`, function() {
        describe("invalid input", function() {
            const { invalid } = def;
            
            invalid.forEach(input => {
                it(`should not accept invalid input: ${input}`, function() {
                    expect(function() {
                        new ctor(input);
                    })
                    .to.throwException();
                });
            });
        });
        
        describe("valid input", function() {
            const { valid } = def;
            
            valid.forEach(input => {
                it(`should accept valid input: ${input}`, function() {
                    expect(function() {
                        new ctor(input);
                    })
                    .to.not.throwException();
                });
            });
        });
        
        describe("methods", function() {
            let object;
            
            describe("constructor", function() {
                const methodTests = def['new'];
                
                it("should not throw exception on input", function() {
                    expect(function() {
                        object = new ctor(methodTests.input);
                    })
                    .to.not.throwException();
                });
                
                it("should return range object", function() {
                    expect(object instanceof ctor).to.be(true);
                });
                
                it("should return correct size", function() {
                    expect(object.size).to.be(methodTests.size);
                });
                
                describe("has()", function() {
                    describe("list", function() {
                        it("should return true on list has() check", function() {
                            expect(object.has(methodTests.in_list)).to.be(true);
                        });
                    });
                    
                    describe("scalar", function() {
                        methodTests.in_list.forEach(value => {
                            it(`should return true on has(${value})`, function() {
                                expect(object.has(value)).to.be(true);
                            });
                        });
                    });
                });
                
                describe("range output", function() {
                    it("should return correct array", function() {
                        expect(object.toArray()).to.eql(methodTests.range_array);
                    });
                    
                    it("should return correct string", function() {
                        expect(object.toString()).to.eql(methodTests.range_string);
                    });
                });
                
                describe("collapsed output", function() {
                    it("should return correct array", function() {
                        expect(object.collapse().toArray()).to.eql(methodTests.collapsed_array);
                    });
                    
                    it("should return correct string", function() {
                        expect(object.collapse().toString()).to.eql(methodTests.collapsed_string);
                    });
                });
            });
        });
    });
};
