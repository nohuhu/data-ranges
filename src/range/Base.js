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
            return false;
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
}

Range.prototype.Box = Box;

module.exports = Range;
