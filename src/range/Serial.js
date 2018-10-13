const IntegerRange = require('./Integer');

const _patternRe = /^\d+(?:(?:\.\.|-)\d+)?$/;
const _rangeRe = /^(?<from>\d+)(?:\.\.|-)(?<to>\d+)$/;
const _rangeSeparator = '-';

class SerialRange extends IntegerRange {
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
        const converted = super.convertItem(item);
        
        if (converted < 0) {
            throw new Error(`Invalid item: ${item}`);
        }
        
        return converted;
    }
}

module.exports = SerialRange;
