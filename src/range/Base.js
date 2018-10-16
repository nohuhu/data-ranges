const Box = require('../box/Base');

class Range {
    constructor(start, end, options) {
        if (start == null) {
            throw new Error(`Invalid start value: ${start}`);
        }
        
        if (arguments.length > 1 && end == null) {
            throw new Error(`Invalid end value: ${end}`);
        }
        
        if (arguments.length === 1) {
            end = start;
        }
        
        start = this.wrap(start);
        end = this.wrap(end);
        
        if (start.isGreaterThan(end)) {
            this.start = end;
            this.end = start;
        }
        else {
            this.start = start;
            this.end = end;
        }
        
        if (options) {
            for (let option in options) {
                this[option] = options[option];
            }
        }
    }
    
    static get patternRe() {
        throw new Exception("patternRe getter should be implemented in a subclass.");
    }
    
    static get rangeRe() {
        throw new Exception("rangeRe getter should be implemented in a subclass.");
    }
    
    get size() {
        throw new Error("size getter should be implemented in a subclass.");
    }
    
    wrap(value) {
        return new this.Box(value);
    }
    
    clone() {
        return new this.constructor(this.start.valueOf(), this.end.valueOf());
    }
    
    relatedTo(other) {
        if (other == null) {
            return false;
        }
        
        if (other instanceof Range) {
            return this.relatedTo(other.start) || this.relatedTo(other.end);
        }
        
        if (!(other instanceof Box)) {
            other = this.wrap(other);
        }
        
        return this.contains(other) ||
               this.start.equals(other.next()) || this.end.equals(other.prev());
    }
    
    contains(other) {
        if (other == null) {
            return false;
        }
        
        if (other instanceof Range) {
            return this.contains(other.start) && this.contains(other.end);
        }
        
        return this.start.equals(other) || this.end.equals(other) ||
               (this.start.isLesserThan(other) && this.end.isGreaterThan(other));
    }
    
    absorb(other) {
        if (other == null) {
            return this;
        }
        
        if (other instanceof Range) {
            this.absorb(other.start);
            this.absorb(other.end);
            
            return this;
        }
        
        if (!(other instanceof Box)) {
            other = this.wrap(other);
        }
        
        if (this.start.isGreaterThan(other)) {
            this.start = other;
        }
        else if (this.end.isLesserThan(other)) {
            this.end = other;
        }
        
        return this;
    }
    
    remove(other) {
        if (other == null) {
            return [this];
        }
        
        if (!(other instanceof Range) && !(other instanceof Box)) {
            other = this.wrap(other);
        }
        
        // The other range is outside of this one:
        //              [ x, y ]          <- this
        //     [ n, m ]                   <- other, or
        //                       [ m, n ] <- other
        if (other.end.isLesserThan(this.start) || other.start.isGreaterThan(this.end)) {
            // No change
            return [this];
        }
        
        // The other range is equal to this one:
        //              [ x, y ]          <- this
        //              [ x, y ]          <- other
        else if (this.start.equals(other.start) && this.end.equals(other.end)) {
            // All values are removed
            return [];
        }
        
        // The other range is completely including this one:
        //              [ x, y ]          <- this
        //          [ x - n, y + m ]      <- other
        else if (other.start.isLesserThan(this.start) && other.end.isGreaterThan(this.end)) {
            // Ditto
            return [];
        }
        
        // The other range overlaps with this one on the start side:
        //                  [ x, y ]      <- this
        //       [ x - n, y - m ]         <- other
        else if (other.start.isLesserThan(this.start) && other.end.isLesserThan(this.end)) {
            // Other end is the new start
            this.start = other.end.clone();
            
            return [this];
        }
        
        // The other range overlaps with this one on the end side:
        //           [ x, y ]             <- this
        //              [ x + n, y + m ]  <- other
        else if (other.start.isGreaterThan(this.start) && other.end.isGreaterThan(this.end)) {
            // Other start is the new end
            this.end = other.start.clone();
            
            return [this];
        }
        
        // The only option left is that the other range is contained within this one:
        //         [   x,     y       ]   <- this
        //           [ x + n, y - m ]     <- other
        else {
            const range1 = new this.constructor(this.start.valueOf(), other.start.prev());
            const range2 = new this.constructor(other.end.next(), this.end.valueOf());
            
            return [range1, range2];
        }
    }
    
    *by(precision, options) {
        const { start, end } = this;
        
        yield start.valueOf();
        
        let current = start;
        
        while (current.isLesserThan(end)) {
            current = this.wrap(current.next(precision, options));
            
            yield current.valueOf();
        }
    }
    
    valueOf() {
        if (this.start.equals(this.end)) {
            return this.start.valueOf();
        }
        
        return this.toString();
    }
    
    toString() {
        if (this.start.equals(this.end)) {
            return this.start.toString()
        }
        
        return this.start.toString() + this.delimiter + this.end.toString();
    }
    
    sortFn() {
        throw new Error("sortFn() should be implemented in a subclass.");
    }
    
    equals(a, b) {
        throw new Error("equals() should be implemented in a subclass.");
    }
}

Range.prototype.Box = Box;

module.exports = Range;
