const expect = require('expect.js');
const Range = require('../src/Range');

module.exports = function makeSuite(type, def, ctor) {
    describe(`type: ${type}`, function() {
        describe("invalid input", function() {
            const { invalid } = def;
            
            invalid.forEach(input => {
                it(`should not accept invalid input: "${input}"`, function() {
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
                it(`should accept valid input: "${input}"`, function() {
                    expect(function() {
                        new ctor(input);
                    })
                    .to.not.throwException();
                });
            });
        });
        
        describe("methods", function() {
            let object;
            
            function makeMethodSuite(method, methodTests) {
                describe(method, function() {
                    if (method === 'new') {
                        it("should not throw exception on input", function() {
                            expect(function() {
                                object = new ctor(methodTests.input);
                            })
                            .to.not.throwException();
                        });
                        
                        it("should return range object", function() {
                            expect(object instanceof ctor).to.be(true);
                        });
                    }
                    else {
                        it("should not throw exception on input", function() {
                            expect(function() {
                                object[method](methodTests.input);
                            })
                            .to.not.throwException();
                        });
                    }
                    
                    it("should return correct size", function() {
                        expect(object.size).to.be(methodTests.size);
                    });
                    
                    describe("has()", function() {
                        describe("list", function() {
                            it("should return true on list has() check", function() {
                                expect(object.has(methodTests.has_list)).to.be(true);
                            });
                        });
                        
                        describe("scalar", function() {
                            methodTests.has_list.forEach(value => {
                                it(`should return true on has(${value})`, function() {
                                    expect(object.has(value)).to.be(true);
                                });
                            });
                        });
                    });
                    
                    describe("hasItems", function() {
                        it("should return correct list of missing items", function() {
                            const missing = object.hasItems(methodTests.has_in);
                            
                            expect(missing).to.eql(methodTests.has_out);
                        });
                    });
                    
                    describe("range output", function() {
                        it("should return correct array", function() {
                            expect(object.valueOf()).to.eql(methodTests.valueOf);
                        });
                        
                        it("should return correct string", function() {
                            expect(object.toString()).to.eql(methodTests.toString);
                        });
                    });
                    
                    describe("collapsed output", function() {
                        it("should return correct string", function() {
                            expect(object.collapse()).to.eql(methodTests.collapsed);
                        });
                    });
                });
            }
            
            ['new', 'add', 'remove'].forEach(method => makeMethodSuite(method, def[method]));
        });
    });
};
