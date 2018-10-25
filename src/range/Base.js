const Box = require('../box/Base');

class Range {
    static factory(params) {
        if (params == null || typeof params !== 'object') {
            throw new Error("Invalid Range factory() arguments");
        }
        
        let { values, options } = params;
        options = options || {};
        
        if (typeof values === 'string') {
            const separatorRe = options.separatorRe || this._separatorRe;
            
            return values.split(separatorRe).map(v => new this({ start: v, ...options }));
        }
        else {
            return [new this({ start: values, ...options })];
        }
    }
    
    constructor(options) {
        if (options == null || typeof options !== 'object') {
            throw new Error("Invalid Range constructor arguments");
        }
        
        this.options = { ...options };
        delete this.options.start;
        delete this.options.end;
        
        let { start, end } = options;
        
        if (start == null || (typeof start === 'string' && !this.patternRe.test(start))) {
            throw new Error(`Invalid input: ${start}`);
        }
        
        let match;
        
        if ('end' in options) {
            if (end == null || (typeof end === 'string' && !this.patternRe(end))) {
                throw new Error(`Invalid input: ${end}`);
            }
        }
        else if (typeof start === 'string' && (match = this.rangeRe.exec(start))) {
            if (!match.groups || !match.groups.start || !match.groups.end) {
                throw new Error(`Invalid input: ${start}`);
            }
            
            start = match.groups.start;
            end = match.groups.end;
        }
        
        if (end == null) {
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
    }
    
    get separator() {
        return this.options.separator || this._separator;
    }
    
    get patternRe() {
        return this.options.patternRe || this._patternRe;
    }
    
    get rangeRe() {
        return this.options.rangeRe || this._rangeRe;
    }
    
    get delimiter() {
        return this.options.delimiter || this._delimiter;
    }
    
    get size() {
        throw new Error("size getter should be implemented in a child class.");
    }
    
    parseValue(value) {
        return value;
    }
    
    wrap(value) {
        return new this.Box(this.parseValue(value));
    }
    
    clone() {
        return new this.constructor({
            start: this.start.valueOf(),
            end: this.end.valueOf(),
            ...this.options,
        });
    }
    
    equals(other) {
        return this.start.equals(other.start) && this.end.equals(other.end);
    }
    
    contains(other) {
        if (other == null) {
            return false;
        }
        
        if (other instanceof Range) {
            return this.start.isLTE(other.start) && this.end.isGTE(other.end);
        }
        
        return this.start.isLTE(other) && this.end.isGTE(other);
    }
    
    overlaps(other) {
        if (other == null) {
            return false;
        }
        
        if (other instanceof Box) {
            return this.contains(other);
        }
        
        const myStart = this.start,
              theirStart = other.start,
              myEnd = this.end,
              theirEnd = other.end;
        
        return (myStart.isLTE(theirStart) && myEnd.isGTE(theirStart)) ||
               (myStart.isGTE(theirStart) && myStart.isLTE(theirEnd) && myEnd.isGTE(theirEnd));
    }
    
    adjacent(other) {
        if (other == null) {
            return false;
        }
        
        if (other instanceof Range) {
            return this.start.equals(other.end.next()) || this.end.equals(other.start.prev());
        }
        
        if (!(other instanceof Box)) {
            other = this.wrap(other);
        }
        
        return this.start.equals(other.next()) || this.end.equals(other.prev());
    }
    
    meets(other) {
        if (other == null) {
            return false;
        }
        
        return this.equals(other) || this.contains(other) || 
               (other.contains && other.contains(this)) ||
               this.overlaps(other);
    }
    
    relatedTo(other) {
        if (other == null) {
            return false;
        }
        
        return this.meets(other) || this.adjacent(other);
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
        
        const myStartGteOtherStart =
            this.start.equals(other.start) || this.start.isGreaterThan(other.start);
        
        const myEndLteOtherEnd =
            this.end.equals(other.end) || this.end.isLesserThan(other.end);
        
        // The other range is equal to this one, or is a superset of this:
        //              [ x, y ]          <- this
        //              [ x, y ]          <- other, or
        //          [ x - n, y + m ]      <- other
        if (myStartGteOtherStart && myEndLteOtherEnd) {
            // All values are removed
            return [];
        }
        
        // The other range is outside of this one:
        //              [ x, y ]          <- this
        //     [ n, m ]                   <- other, or
        //                       [ m, n ] <- other
        else if (other.end.isLesserThan(this.start) || other.start.isGreaterThan(this.end)) {
            // No change
            return [this];
        }
        
        // The other range overlaps with this one on the start side:
        //                  [ x, y ]      <- this
        //       [ x - n, y - m ]         <- other
        else if (myStartGteOtherStart && other.end.isLesserThan(this.end)) {
            // Other end + 1 is the new start
            const newStart = this.wrap(other.end.next());
            
            if (newStart.isGreaterThan(this.end)) {
                return [];
            }
            
            this.start = newStart;
            
            return [this];
        }
        
        // The other range overlaps with this one on the end side:
        //           [ x, y ]             <- this
        //              [ x + n, y + m ]  <- other
        else if (other.start.isGreaterThan(this.start) && myEndLteOtherEnd) {
            // Other start - 1 is the new end
            const newEnd = this.wrap(other.start.prev());
            
            if (newEnd.isLesserThan(this.start)) {
                return [];
            }
            
            this.end = newEnd;
            
            return [this];
        }
        
        // The only option left is that the other range is contained within this one:
        //         [   x,     y       ]   <- this
        //           [ x + n, y - m ]     <- other
        else {
            const range1 = new this.constructor({
                start: this.start.valueOf(),
                end: other.start.prev(),
                ...this.options,
            });
            
            const range2 = new this.constructor({
                start: other.end.next(),
                end: this.end.valueOf(),
                ...this.options,
            });
            
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
}

Range.prototype.Box = Box;
Range.prototype._separator = ',';
Range._separatorRe = /\s*[,;]\s*/;

module.exports = Range;
