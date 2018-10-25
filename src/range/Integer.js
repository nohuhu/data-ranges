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
}

IntegerRange.prototype.Box = IntegerBox;
IntegerRange.prototype._patternRe = /^\s*[-+]?\d+\s*(?:\.\.\s*[-+]?\d+)?\s*$/;
IntegerRange.prototype._rangeRe = /^\s*(?<start>[-+]?\d+)\s*\.\.\s*(?<end>[-+]?\d+)\s*$/;
IntegerRange.prototype._delimiter = '..';

module.exports = IntegerRange;
