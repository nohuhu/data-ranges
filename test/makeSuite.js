const expect = require('expect.js');
const path = require('path');

const RangeSet = require('../src/RangeSet');

const makeSuite = (type, def, ctor) => {
    describe(`type: ${type}`, function() {
        describe("invalid input", function() {
            const { invalid } = def;
            
            invalid.forEach(input => {
                it(`should not accept invalid input: "${input}"`, function() {
                    expect(function() {
                        new RangeSet(ctor, input);
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
                        new RangeSet(ctor, input);
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
                                object = new RangeSet(ctor, methodTests.input);
                            })
                            .to.not.throwException();
                        });
                        
                        it("should return RangeSet object", function() {
                            expect(object instanceof RangeSet).to.be(true);
                        });
                    }
                    else {
                        it("should not throw exception on input", function() {
                            expect(function() {
                                debugger;
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
                    
                    xdescribe("range output", function() {
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
            
            makeMethodSuite('new', def['new']);
            makeMethodSuite('add', def.add);
//             ['new', 'add', 'remove'].forEach(method => makeMethodSuite(method, def[method]));
        });
    });
};

const toArray = (...strings) => {
    let result = [];
    
    for (let str of strings) {
        result = [].concat(result, str.split(' ').map(item => parseInt(item)));
    }
    
    return result;
};

const makeTests = (type, tests) => {
    let Range = require(path.join('..', 'src', 'range', type));
    
    describe(`${type} ranges`, function() {
        describe("module tests", function() {
            it("should export Range constructor", function() {
                expect(typeof Range).to.be('function');
            });
        });
        
        describe("functional tests", function() {
            tests.forEach(test => makeSuite(test.type, test, Range));
        });
    });
};

module.exports = {
    makeSuite,
    makeTests,
    toArray,
};
