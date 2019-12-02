describe("base Range", function() {
    let Range;
    
    it("should compile", function() {
        expect(function() {
            Range = require('../src/range/Base');
        })
        .not.toThrow();
    });
    
    it("should export Range constructor", function() {
        expect(typeof Range).toBe('function');
    });
    
    it("should be able to construct", function() {
        expect(function() {
            let object = new Range({ start: 0 });
        })
        .not.toThrow();
    });
    
    it("should be able to clone itself", function() {
        const object = new Range({ start: 0, end: 42, foo: 'bar' });
        const clone = object.clone();
        
        expect(clone).not.toBe(object);
        expect(clone.start.value).toBe(object.start.value);
        expect(clone.end.value).toBe(object.end.value);
        expect(clone.options.foo).toBe('bar');
    });
    
    describe("predicates", function() {
        let A, B;
        
        afterEach(function() {
            A = B = null;
        });
        
        describe("equals", function() {
            describe("true", function() {
                it("should return true for non-collapsed range", function() {
                    A = new Range({ start: 1, end: 3 });
                    B = new Range({ start: 1, end: 3 });
                    
                    expect(A.equals(B)).toBe(true);
                    expect(B.equals(A)).toBe(true);
                });
                
                it("should return true for collapsed range", function() {
                    A = new Range({ start: 1, end: 1 });
                    B = new Range({ start: 1, end: 1 });
                    
                    expect(A.equals(B)).toBe(true);
                    expect(B.equals(A)).toBe(true);
                });
            });
            
            describe("false", function() {
                describe("non-collapsed ranges", function() {
                    it("should return false when start !== start", function() {
                        A = new Range({ start: 1, end: 3 });
                        B = new Range({ start: 2, end: 3 });
                        
                        expect(A.equals(B)).toBe(false);
                        expect(B.equals(A)).toBe(false);
                    });
                    
                    it("should return false when end !== end", function() {
                        A = new Range({ start: 1, end: 3 });
                        B = new Range({ start: 1, end: 4 });
                        
                        expect(A.equals(B)).toBe(false);
                        expect(B.equals(A)).toBe(false);
                    });
                    
                    it("should return false when both ends are not equal", function() {
                        A = new Range({ start: 1, end: 3 });
                        B = new Range({ start: 2, end: 4 });
                        
                        expect(A.equals(B)).toBe(false);
                        expect(B.equals(A)).toBe(false);
                    });
                    
                    it("should return false for disjointed ranges", function() {
                        A = new Range({ start: 1, end: 3 });
                        B = new Range({ start: 4, end: 6 });
                        
                        expect(A.equals(B)).toBe(false);
                        expect(B.equals(A)).toBe(false);
                    });
                    
                    it("should return false when A contains B", function() {
                        A = new Range({ start: 1, end: 10 });
                        B = new Range({ start: 2, end: 5 });
                        
                        expect(A.equals(B)).toBe(false);
                        expect(B.equals(A)).toBe(false);
                    });
                    
                    it("should return false when A overlaps B", function() {
                        A = new Range({ start: 1, end: 5 });
                        B = new Range({ start: 3, end: 8 });
                        
                        expect(A.equals(B)).toBe(false);
                        expect(B.equals(A)).toBe(false);
                    });
                });
                
                describe("collapsed ranges", function() {
                    it("should return false for disjointed ranges", function() {
                        A = new Range({ start: 1, end: 5 });
                        B = new Range({ start: 8, end: 10 });
                        
                        expect(A.equals(B)).toBe(false);
                        expect(B.equals(A)).toBe(false);
                    });
                });
            });
        });
        
        describe("contains", function() {
            describe("true", function() {
                it("A is non-collapsed and B is collapsed, B within A", function() {
                    A = new Range({ start: 1, end: 5 });
                    B = new Range({ start: 3 });
                    
                    expect(A.contains(B)).toBe(true);
                    expect(B.contains(A)).toBe(false);
                });
                
                it("A is non-collapsed and B is collapsed, B on left edge of A", function() {
                    A = new Range({ start: 1, end: 5 });
                    B = new Range({ start: 1 });
                    
                    expect(A.contains(B)).toBe(true);
                    expect(B.contains(A)).toBe(false);
                });
                
                it("A is non-collapsed and B is collapsed, B on right edge of A", function() {
                    A = new Range({ start: 1, end: 5 });
                    B = new Range({ start: 5 });
                    
                    expect(A.contains(B)).toBe(true);
                    expect(B.contains(A)).toBe(false);
                });
                
                it("A is non-collapsed and B is non-collapsed, B within A", function() {
                    A = new Range({ start: 1, end: 10 });
                    B = new Range({ start: 3, end: 5 });
                    
                    expect(A.contains(B)).toBe(true);
                    expect(B.contains(A)).toBe(false);
                });
                
                it("A is non-collapsed and B is non-collapsed, A == B", function() {
                    A = new Range({ start: 1, end: 10 });
                    B = new Range({ start: 1, end: 10 });
                    
                    expect(A.contains(B)).toBe(true);
                    expect(B.contains(A)).toBe(true);
                });
                
                it("A is collapsed and B is collapsed, A == B", function() {
                    A = new Range({ start: 3 });
                    B = new Range({ start: 3 });
                    
                    expect(A.contains(B)).toBe(true);
                    expect(B.contains(A)).toBe(true);
                });
            });
            
            describe("false", function() {
                it("should return false when non-collapsed A and B are disjointed", function() {
                    A = new Range({ start: 1, end: 3 });
                    B = new Range({ start: 5, end: 8 });
                    
                    expect(A.contains(B)).toBe(false);
                    expect(B.contains(A)).toBe(false);
                });
                
                it("should return false for disjointed collapsed A and B", function() {
                    A = new Range({ start: 1 });
                    B = new Range({ start: 5 });
                    
                    expect(A.contains(B)).toBe(false);
                    expect(B.contains(A)).toBe(false);
                });
                
                it("should return false for overlapping non-collapsed A and B", function() {
                    A = new Range({ start: 1, end: 5 });
                    B = new Range({ start: 3, end: 8 });
                    
                    expect(A.contains(B)).toBe(false);
                    expect(B.contains(A)).toBe(false);
                });
            });
        });
        
        describe("overlaps", function() {
            describe("true", function() {
                describe("A non-collapsed, B non-collapsed", function() {
                    it("A == B", function() {
                        A = new Range({ start: 1, end: 5 });
                        B = new Range({ start: 1, end: 5 });
                        
                        expect(A.overlaps(B)).toBe(true);
                        expect(B.overlaps(A)).toBe(true);
                    });
                    
                    it("A touches B", function() {
                        A = new Range({ start: 1, end: 5 });
                        B = new Range({ start: 5, end: 10 });
                        
                        expect(A.overlaps(B)).toBe(true);
                        expect(B.overlaps(A)).toBe(true);
                    });
                    
                    it("A.start < B.start && A.end < B.end", function() {
                        A = new Range({ start: 1, end: 5 });
                        B = new Range({ start: 3, end: 8 });
                        
                        expect(A.overlaps(B)).toBe(true);
                        expect(B.overlaps(A)).toBe(true);
                    });
                    
                    it("A.start == B.start && A.end < B.end", function() {
                        A = new Range({ start: 1, end: 5 });
                        B = new Range({ start: 1, end: 10 });
                        
                        expect(A.overlaps(B)).toBe(true);
                        expect(B.overlaps(A)).toBe(true);
                    });
                    
                    it("A.start < B.start && A.end == B.end", function() {
                        A = new Range({ start: 1, end: 5 });
                        B = new Range({ start: 3, end: 5 });
                        
                        expect(A.overlaps(B)).toBe(true);
                        expect(B.overlaps(A)).toBe(true);
                    });
                });
                
                describe("A non-collapsed, B collapsed", function() {
                    it("B == A.start", function() {
                        A = new Range({ start: 1, end: 5 });
                        B = new Range({ start: 1 });
                        
                        expect(A.overlaps(B)).toBe(true);
                        expect(B.overlaps(A)).toBe(true);
                    });
                    
                    it("B == A.end", function() {
                        A = new Range({ start: 1, end: 5 });
                        B = new Range({ start: 5 });
                        
                        expect(A.overlaps(B)).toBe(true);
                        expect(B.overlaps(A)).toBe(true);
                    });
                });
                
                describe("both collapsed", function() {
                    it("A == B", function() {
                        A = new Range({ start: 3 });
                        B = new Range({ start: 3 });
                        
                        expect(A.overlaps(B)).toBe(true);
                        expect(B.overlaps(A)).toBe(true);
                    });
                });
            });
            
            describe("false", function() {
                it("A non-collapsed, B non-collapsed, disjointed", function() {
                    A = new Range({ start: 1, end: 5 });
                    B = new Range({ start: 6, end: 10 });
                    
                    expect(A.overlaps(B)).toBe(false);
                    expect(B.overlaps(A)).toBe(false);
                });
                
                it("A non-collapsed, B collapsed, disjointed", function() {
                    A = new Range({ start: 1, end: 5 });
                    B = new Range({ start: 0 });
                    
                    expect(A.overlaps(B)).toBe(false);
                    expect(B.overlaps(A)).toBe(false);
                });
                
                it("both collapsed, disjointed", function() {
                    A = new Range({ start: 1 });
                    B = new Range({ start: 2 });
                    
                    expect(A.overlaps(B)).toBe(false);
                    expect(B.overlaps(A)).toBe(false);
                });
            });
        });
        
        describe("adjacent", function() {
            let R;
            
            beforeEach(function() {
                const Box = require('../src/box/Integer');
                
                R = class extends Range {};
                R.prototype.Box = Box;
            });
            
            describe("true", function() {
                it("A non-collapsed, B non-collapsed", function() {
                    A = new R({ start: 1, end: 5 });
                    B = new R({ start: 6, end: 10 });
                    
                    expect(A.adjacent(B)).toBe(true);
                    expect(B.adjacent(A)).toBe(true);
                });
                
                it("A non-collapsed, B collapsed", function() {
                    A = new R({ start: 1, end: 5 });
                    B = new R({ start: 6 });
                    
                    expect(A.adjacent(B)).toBe(true);
                    expect(B.adjacent(A)).toBe(true);
                });
                
                it("both collapsed", function() {
                    A = new R({ start: 5 });
                    B = new R({ start: 6 });
                    
                    expect(A.adjacent(B)).toBe(true);
                    expect(B.adjacent(A)).toBe(true);
                });
                
                it("A is a range, B is a value", function() {
                    A = new R({ start: 1, end: 5 });
                    B = 6;
                    
                    expect(A.adjacent(B)).toBe(true);
                });
                
                it("A is a range, B is a box", function() {
                    A = new R({ start: 5, end: 10 });
                    B = new A.Box(4);
                    
                    expect(A.adjacent(B)).toBe(true);
                });
            });
            
            describe("false", function() {
                it("A non-collapsed, B non-collapsed", function() {
                    A = new R({ start: 1, end: 5 });
                    B = new R({ start: 7, end: 10 });
                    
                    expect(A.adjacent(B)).toBe(false);
                    expect(B.adjacent(A)).toBe(false);
                });
                
                it("A non-collapsed, B collapsed", function() {
                    A = new R({ start: 1, end: 5 });
                    B = new R({ start: 7 });
                    
                    expect(A.adjacent(B)).toBe(false);
                    expect(B.adjacent(A)).toBe(false);
                });
                
                it("both collapsed", function() {
                    A = new R({ start: 1 });
                    B = new R({ start: 10 });
                    
                    expect(A.adjacent(B)).toBe(false);
                    expect(B.adjacent(A)).toBe(false);
                });
                
                it("A is a range, B is a value", function() {
                    A = new R({ start: 5, end: 10 });
                    B = 12;
                    
                    expect(A.adjacent(B)).toBe(false);
                });
                
                it("A is a range, B is a Box", function() {
                    A = new R({ start: 1, end: 10 });
                    B = new A.Box(-1);
                    
                    expect(A.adjacent(B)).toBe(false);
                });
            });
        });
    });
});
