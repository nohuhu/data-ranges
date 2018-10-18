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
    
    describe("predicates", function() {
        let A, B;
        
        afterEach(function() {
            A = B = null;
        });
        
        describe("equals", function() {
            describe("true", function() {
                it("should return true for non-collapsed range", function() {
                    A = new Range(1, 3);
                    B = new Range(1, 3);
                    
                    expect(A.equals(B)).to.be(true);
                    expect(B.equals(A)).to.be(true);
                });
                
                it("should return true for collapsed range", function() {
                    A = new Range(1, 1);
                    B = new Range(1, 1);
                    
                    expect(A.equals(B)).to.be(true);
                    expect(B.equals(A)).to.be(true);
                });
            });
            
            describe("false", function() {
                describe("non-collapsed ranges", function() {
                    it("should return false when start !== start", function() {
                        A = new Range(1, 3);
                        B = new Range(2, 3);
                        
                        expect(A.equals(B)).to.be(false);
                        expect(B.equals(A)).to.be(false);
                    });
                    
                    it("should return false when end !== end", function() {
                        A = new Range(1, 3);
                        B = new Range(1, 4);
                        
                        expect(A.equals(B)).to.be(false);
                        expect(B.equals(A)).to.be(false);
                    });
                    
                    it("should return false when both ends are not equal", function() {
                        A = new Range(1, 3);
                        B = new Range(2, 4);
                        
                        expect(A.equals(B)).to.be(false);
                        expect(B.equals(A)).to.be(false);
                    });
                    
                    it("should return false for disjointed ranges", function() {
                        A = new Range(1, 3);
                        B = new Range(4, 6);
                        
                        expect(A.equals(B)).to.be(false);
                        expect(B.equals(A)).to.be(false);
                    });
                    
                    it("should return false when A contains B", function() {
                        A = new Range(1, 10);
                        B = new Range(2, 5);
                        
                        expect(A.equals(B)).to.be(false);
                        expect(B.equals(A)).to.be(false);
                    });
                    
                    it("should return false when A overlaps B", function() {
                        A = new Range(1, 5);
                        B = new Range(3, 8);
                        
                        expect(A.equals(B)).to.be(false);
                        expect(B.equals(A)).to.be(false);
                    });
                });
                
                describe("collapsed ranges", function() {
                    it("should return false for disjointed ranges", function() {
                        A = new Range(1, 5);
                        B = new Range(8, 10);
                        
                        expect(A.equals(B)).to.be(false);
                        expect(B.equals(A)).to.be(false);
                    });
                });
            });
        });
        
        describe("contains", function() {
            describe("true", function() {
                it("A is non-collapsed and B is collapsed, B within A", function() {
                    A = new Range(1, 5);
                    B = new Range(3);
                    
                    expect(A.contains(B)).to.be(true);
                    expect(B.contains(A)).to.be(false);
                });
                
                it("A is non-collapsed and B is collapsed, B on left edge of A", function() {
                    A = new Range(1, 5);
                    B = new Range(1);
                    
                    expect(A.contains(B)).to.be(true);
                    expect(B.contains(A)).to.be(false);
                });
                
                it("A is non-collapsed and B is collapsed, B on right edge of A", function() {
                    A = new Range(1, 5);
                    B = new Range(5);
                    
                    expect(A.contains(B)).to.be(true);
                    expect(B.contains(A)).to.be(false);
                });
                
                it("A is non-collapsed and B is non-collapsed, B within A", function() {
                    A = new Range(1, 10);
                    B = new Range(3, 5);
                    
                    expect(A.contains(B)).to.be(true);
                    expect(B.contains(A)).to.be(false);
                });
                
                it("A is non-collapsed and B is non-collapsed, A == B", function() {
                    A = new Range(1, 10);
                    B = new Range(1, 10);
                    
                    expect(A.contains(B)).to.be(true);
                    expect(B.contains(A)).to.be(true);
                });
                
                it("A is collapsed and B is collapsed, A == B", function() {
                    A = new Range(3);
                    B = new Range(3);
                    
                    expect(A.contains(B)).to.be(true);
                    expect(B.contains(A)).to.be(true);
                });
            });
            
            it("should return false when non-collapsed A and B are disjointed", function() {
                A = new Range(1, 3);
                B = new Range(5, 8);
                
                expect(A.contains(B)).to.be(false);
                expect(B.contains(A)).to.be(false);
            });
            
            it("should return false for disjointed collapsed A and B", function() {
                A = new Range(1);
                B = new Range(5);
                
                expect(A.contains(B)).to.be(false);
                expect(B.contains(A)).to.be(false);
            });
            
            it("should return false for overlapping non-collapsed A and B", function() {
                A = new Range(1, 5);
                B = new Range(3, 8);
                
                expect(A.contains(B)).to.be(false);
                expect(B.contains(A)).to.be(false);
            });
        });
        
        describe("overlaps", function() {
            describe("true", function() {
                describe("A non-collapsed, B non-collapsed", function() {
                    it("A == B", function() {
                        A = new Range(1, 5);
                        B = new Range(1, 5);
                        
                        expect(A.overlaps(B)).to.be(true);
                        expect(B.overlaps(A)).to.be(true);
                    });
                    
                    it("A contains B", function() {
                        A = new Range(1, 10);
                        B = new Range(3, 8);
                        
                        expect(A.overlaps(B)).to.be(true);
                        expect(B.overlaps(A)).to.be(true);
                    });
                    
                    it("A touches B", function() {
                        A = new Range(1, 5);
                        B = new Range(5, 10);
                        
                        expect(A.overlaps(B)).to.be(true);
                        expect(B.overlaps(A)).to.be(true);
                    });
                    
                    it("A.start < B.start && A.end < B.end", function() {
                        A = new Range(1, 5);
                        B = new Range(3, 8);
                        
                        expect(A.overlaps(B)).to.be(true);
                        expect(B.overlaps(A)).to.be(true);
                    });
                    
                    it("A.start == B.start && A.end < B.end", function() {
                        A = new Range(1, 5);
                        B = new Range(1, 10);
                        
                        expect(A.overlaps(B)).to.be(true);
                        expect(B.overlaps(A)).to.be(true);
                    });
                    
                    it("A.start < B.start && A.end == B.end", function() {
                        A = new Range(1, 5);
                        B = new Range(3, 5);
                        
                        expect(A.overlaps(B)).to.be(true);
                        expect(B.overlaps(A)).to.be(true);
                    });
                });
                
                describe("A non-collapsed, B collapsed", function() {
                    it("B == A.start", function() {
                        A = new Range(1, 5);
                        B = new Range(1);
                        
                        expect(A.overlaps(B)).to.be(true);
                        expect(B.overlaps(A)).to.be(true);
                    });
                    
                    it("B == A.end", function() {
                        A = new Range(1, 5);
                        B = new Range(5);
                        
                        expect(A.overlaps(B)).to.be(true);
                        expect(B.overlaps(A)).to.be(true);
                    });
                    
                    it("B within A", function() {
                        A = new Range(1, 10);
                        B = new Range(5);
                        
                        expect(A.overlaps(B)).to.be(true);
                        expect(B.overlaps(A)).to.be(true);
                    });
                });
                
                describe("both collapsed", function() {
                    it("A == B", function() {
                        A = new Range(3);
                        B = new Range(3);
                        
                        expect(A.overlaps(B)).to.be(true);
                        expect(B.overlaps(A)).to.be(true);
                    });
                });
            });
            
            describe("false", function() {
                it("A non-collapsed, B non-collapsed, disjointed", function() {
                    A = new Range(1, 5);
                    B = new Range(6, 10);
                    
                    expect(A.overlaps(B)).to.be(false);
                    expect(B.overlaps(A)).to.be(false);
                });
                
                it("A non-collapsed, B collapsed, disjointed", function() {
                    A = new Range(1, 5);
                    B = new Range(0);
                    
                    expect(A.overlaps(B)).to.be(false);
                    expect(B.overlaps(A)).to.be(false);
                });
                
                it("both collapsed, disjointed", function() {
                    A = new Range(1);
                    B = new Range(2);
                    
                    expect(A.overlaps(B)).to.be(false);
                    expect(B.overlaps(A)).to.be(false);
                });
            });
        });
        
        describe("adjacent", function() {
            let R;
            
            before(function() {
                const Box = require('../src/box/Integer');
                
                R = class extends Range {};
                R.prototype.Box = Box;
            });
            
            describe("true", function() {
                it("A non-collapsed, B non-collapsed", function() {
                    A = new R(1, 5);
                    B = new R(6, 10);
                    
                    expect(A.adjacent(B)).to.be(true);
                    expect(B.adjacent(A)).to.be(true);
                });
                
                it("A non-collapsed, B collapsed", function() {
                    A = new R(1, 5);
                    B = new R(6);
                    
                    expect(A.adjacent(B)).to.be(true);
                    expect(B.adjacent(A)).to.be(true);
                });
                
                it("both collapsed", function() {
                    A = new R(5);
                    B = new R(6);
                    
                    expect(A.adjacent(B)).to.be(true);
                    expect(B.adjacent(A)).to.be(true);
                });
                
                it("A is a range, B is a value", function() {
                    A = new R(1, 5);
                    B = 6;
                    
                    expect(A.adjacent(B)).to.be(true);
                });
                
                it("A is a range, B is a box", function() {
                    A = new R(5, 10);
                    B = new A.Box(6);
                    
                    expect(A.adjacent(B)).to.be(true);
                });
            });
            
            describe("false", function() {
                it("A non-collapsed, B non-collapsed", function() {
                    A = new R(1, 5);
                    B = new R(7, 10);
                    
                    expect(A.adjacent(B)).to.be(false);
                    expect(B.adjacent(A)).to.be(false);
                });
                
                it("A non-collapsed, B collapsed", function() {
                    A = new R(1, 5);
                    B = new R(7);
                    
                    expect(A.adjacent(B)).to.be(false);
                    expect(B.adjacent(A)).to.be(false);
                });
                
                it("both collapsed", function() {
                    A = new R(1);
                    B = new R(10);
                    
                    expect(A.adjacent(B)).to.be(false);
                    expect(B.adjacent(A)).to.be(false);
                });
                
                it("A is a range, B is a value", function() {
                    A = new R(5, 10);
                    B = 12;
                    
                    expect(A.adjacent(B)).to.be(false);
                });
                
                it("A is a range, B is a Box", function() {
                    A = new R(1, 10);
                    B = new A.Box(-1);
                    
                    expect(A.adjacent(B)).to.be(false);
                });
            });
        });
    });
});
