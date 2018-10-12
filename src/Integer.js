const Range = require('./Range');

const _patternRe = /^[-+]?\d+(?:\.\.[-+]?\d+)?$/;
const _rangeRe = /^(?<from>[-+]?\d+)\.\.(?<to>[-+]?\d+)$/;
const _rangeSeparator = '..';

class IntegerRange extends Range {
    get patternRe() {
        return _patternRe;
    }
    
    get rangeRe() {
        return _rangeRe;
    }
    
    get rangeSeparator() {
        return _rangeSeparator;
    }
    
    convertItem(item) {
        const converted = parseInt(item);
        
        if (isNaN(converted)) {
            throw new Error(`Invalid item: ${item}`);
        }
        
        return converted;
    }
    
    expand(from, to) {
        if (from == null) {
            throw new Error(`Invalid "from" value: ${from}`);
        }
        
        if (to == null) {
            throw new Error(`Invalid "to" value: ${to}`);
        }
        
        from = this.convertItem(from);
        to = this.convertItem(to);
        
        if (from === to) {
            return [from];
        }
        
        if (from > to) {
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
    
    equals(a, b) {
        return a === b;
    }
    
    nextInRange(a, b) {
        return b === a + 1;
    }
};

module.exports = IntegerRange;
