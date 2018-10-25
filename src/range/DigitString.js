const DigitStringBox = require('../box/DigitString');
const Range = require('./Base');

class DigitStringRange extends Range {
    get size() {
        return this.end.numeric - this.start.numeric + 1;
    }
    
    parseValue(raw) {
        return raw;
    }
}

DigitStringRange.prototype.Box = DigitStringBox;
DigitStringRange.prototype._patternRe =
    /^\s*(?:[#*]\d{1,15}|\d{1,16})\s*(?:(?:\.\.|-)\s*(?:[#*]\d{1,15}|\d{1,16}))?\s*$/;
DigitStringRange.prototype._rangeRe =
    /^\s*(?<start>[#*]\d{1,15}|\d{1,16})\s*(?:\.\.|-)\s*(?<end>[#*]\d{1,15}|\d{1,16})\s*$/;
DigitStringRange.prototype._delimiter = '-';

module.exports = DigitStringRange;
