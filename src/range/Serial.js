const IntegerRange = require('./Integer');

class SerialRange extends IntegerRange {
    parseValue(raw) {
        const value = parseInt(raw);
        
        if (isNaN(value) || value < 0) {
            throw new Error(`Invalid input: ${raw}`);
        }
        
        return value;
    }
}

SerialRange.prototype._patternRe = /^\d+(?:(?:\.\.|-)\d+)?$/;
SerialRange.prototype._rangeRe = /^(?<start>\d+)(?:\.\.|-)(?<end>\d+)$/;
SerialRange.prototype._delimiter = '-';

module.exports = SerialRange;
