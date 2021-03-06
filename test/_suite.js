const path = require('path');

const RangeSet = require('../src/RangeSet');

const desc = (want) => {
    if (Array.isArray(want)) {
        return want.length === 0 ? "[empty array]" : want.join(', ');
    }
    
    return want === '' ? "empty string" : want + '';
}

const makeSuite = (def, ctor) => {
    const { name, input, exception, method } = def;
    
    if (!name) {
        throw new Error("Test name is required!");
    }
    
    describe(name, function() {
        let object;
        
        function testContains(checks) {
            if (checks == null) {
                return;
            }
            
            checks.forEach(check => {
                const { input, want, checkEach } = check;
                
                if (Array.isArray(input)) {
                    describe(`contains(), input: ${desc(input)}`, function() {
                        it(`should return ${desc(want)} when passed in array`, function() {
                            const have = object.contains(input);
                            
                            expect(have).toEqual(want);
                        });
                        
                        if (checkEach) {
                            input.forEach(value => {
                                it(`should return ${desc(want)} for ${value}`, function() {
                                    const have = object.contains(value);
                                    
                                    expect(have).toBe(want);
                                });
                            });
                        }
                    });
                }
                else {
                    describe(`contains(), input: ${desc(input)}`, function() {
                        it(`should return ${desc(want)}`, function() {
                            const have = object.contains(input);
                            
                            expect(have).toBe(want);
                        });
                    });
                }
            });
        }
        
        function testContainsAll(checks) {
            if (checks == null) {
                return;
            }
            
            checks.forEach(check => {
                const { input, want } = check;
                
                describe(`containsAll(), input: ${desc(input)}`, function() {
                    let have;
                    
                    beforeEach(function() {
                        have = object.containsAll(input);
                    });
                    
                    it("should return a RangeSet", function() {
                        expect(have instanceof RangeSet).toBe(true);
                    });
                    
                    it(`return value should be ${desc(want)}`, function() {
                        expect(have.toString()).toEqual(want);
                    });
                });
            });
        }
        
        function testBy(want) {
            if (want == null) {
                return;
            }
            
            const wantCopy = [...want];
            
            describe("by()", function() {
                let result = [];
                
                it("should iterate over values", function() {
                    for (let have of object.by()) {
                        expect(have).toBe(wantCopy.shift());
                        result.push(have);
                    }
                });
                
                it("should return all expected values", function() {
                    expect(result).toEqual(want);
                });
            });
        }
        
        function testToString(want) {
            if (want == null) {
                return;
            }
            
            describe("toString()", function() {
                it(`should return ${desc(want)}`, function() {
                    expect(object.toString()).toBe(want);
                });
            });
        }
        
        function testSize(want) {
            if (want == null) {
                return;
            }
            
            describe("size getter", function() {
                it(`should return ${want}`, function() {
                    expect(object.size).toBe(want);
                });
            });
        }
        
        describe("construction", function() {
            const ctorFn = function() {
                let args = { type: ctor };
                
                if ('input' in def) {
                    if (typeof input === 'object' && !Array.isArray(input)) {
                        args = { ...args, ...input };
                    }
                    else {
                        args.values = input;
                    }
                }
                
                object = new RangeSet(args);
            };
            
            if (exception) {
                it("should throw exception", function() {
                    expect(ctorFn).toThrow(exception);
                });
            }
            else {
                it("should not throw exception", function() {
                    expect(ctorFn).not.toThrow();
                });
            }
        });
        
        if (method) {
            const methodInput = def.methodInput;
            
            if (typeof method === 'function') {
                describe("calling custom test code", function() {
                    const methodFn = function() {
                        method(object, methodInput);
                    };
                    
                    if (exception) {
                        it("should throw exception", function() {
                            expect(methodFn).toThrow(exception);
                        });
                    }
                    else {
                        it("should not throw exception", function() {
                            expect(methodFn).not.toThrow();
                        });
                    }
                });
            }
            else {
                if (methodInput == null) {
                    throw new Error("methodInput is required with method!");
                }
                
                describe(`calling ${method}`, function() {
                    const methodFn = function() {
                        object[method](methodInput);
                    };
                    
                    if (exception) {
                        it("should throw exception", function() {
                            except(methodFn).toThrow();
                        });
                    }
                    else {
                        it("should not throw exception", function() {
                            expect(methodFn).not.toThrow();
                        });
                    }
                });
            }
        }
        
        testSize(def.size);
        testToString(def.stringify);
        testContains(def.contains);
        testContainsAll(def.containsAll);
        testBy(def.by);
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
                expect(typeof Range).toBe('function');
            });
        });
        
        describe("functional tests", function() {
            tests.forEach(test => makeSuite(test, type));
        });
    });
};

module.exports = {
    makeTests,
    toArray,
};
