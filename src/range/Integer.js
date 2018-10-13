const IntegerBox = require('../box/Integer');
const Range = require('./Base');

const _patternRe = /^\s*[-+]?\d+\s*(?:\.\.\s*[-+]?\d+)?\s*$/;
const _rangeRe = /^\s*(?<from>[-+]?\d+)\s*\.\.\s*(?<to>[-+]?\d+)\s*$/;
const _delimiter = '..';

class IntegerRange extends Range {
    static get patternRe() {
        return _patternRe;
    }
    
    static get rangeRe() {
        return _rangeRe;
    }
    
    get size() {
        return this.end.valueOf() - this.start.valueOf() + 1;
    }
    
    wrap(value) {
        const converted = parseInt(value);
        
        if (isNaN(converted)) {
            throw new Error(`Invalid value: ${value}`);
        }
        
        return super.wrap(converted);
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
IntegerRange.prototype.delimiter = _delimiter;

module.exports = IntegerRange;
