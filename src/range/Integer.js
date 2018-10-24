const IntegerBox = require('../box/Integer');
const Range = require('./Base');

class IntegerRange extends Range {
    get size() {
        return this.end.valueOf() - this.start.valueOf() + 1;
    }
    
    parseValue(raw) {
        const value = parseInt(raw);
        
        if (isNaN(value)) {
            throw new Error(`Invalid input: ${raw}`);
        }
        
        return value;
    }
    
    expand(from, to) {
        if (from == null) {
            throw new Error(`Invalid "from" value: ${from}`);
        }
        
        if (to == null) {
            throw new Error(`Invalid "to" value: ${to}`);
        }
        
        from = this.wrap(from);
        to = this.wrap(to);
        
        if (from.equals(to)) {
            return [from];
        }
        
        if (from.isGreaterThan(to)) {
            [to, from] = [from, to];
        }
        
        const array = [];
        
        for (let i = from, idx = 0; i <= to; i++) {
            array[idx++] = i;
        }
        
        return array;
    }
    
    sortFn(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
    }
    
    nextInRange(a, b) {
        return b === a + 1;
    }
};

IntegerRange.prototype.Box = IntegerBox;
IntegerRange.prototype._patternRe = /^\s*[-+]?\d+\s*(?:\.\.\s*[-+]?\d+)?\s*$/;
IntegerRange.prototype._rangeRe = /^\s*(?<start>[-+]?\d+)\s*\.\.\s*(?<end>[-+]?\d+)\s*$/;
IntegerRange.prototype._delimiter = '..';

module.exports = IntegerRange;
