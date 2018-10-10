const Range = require('./Range');

const _patternRe = /^[-+]?\d+(\.\.[-+]?\d+)?$/;
const _rangeRe = /^(?<from>[-+]?\d+)\.\.(?<to>[-+]?\d+)$/;

class IntegerRange extends Range {
    get patternRe() {
        return _patternRe;
    }
    
    get rangeRe() {
        return _rangeRe;
    }
    
    convertItem(item) {
        const converted = parseInt(item);
        
        if (isNaN(converted)) {
            throw new Error(`Invalid item: ${item}`);
        }
        
        return converted;
    }
    
    explode(from, to) {
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
};

module.exports = IntegerRange;
