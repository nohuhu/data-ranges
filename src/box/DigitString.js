const Box = require('./Base');

class DigitStringBox extends Box {
    constructor(value) {
        super(value);
        
        [this.length, this.prefix, this.numeric] = this._parse(value);
    }
    
    _parse(value, unbox) {
        value = value instanceof Box ? value.valueOf() : value;
        
        const result =
            /^[#*]/.test(value)
                ? [value.length, value.substr(0, 1), parseInt(value.substr(1))]
                : [value.length, '', parseInt(value)];
        
        return unbox ? [...result, value] : result;
    }
    
    toString() {
        return this.value;
    }
    
    _isGT(other) {
        const { length, prefix, numeric } = this;
        const [ otherLength, otherPrefix, otherNumeric ] = this._parse(other);
        
        // *123 < #123 < 123 && *123 < *1234 < 123
        if (prefix !== otherPrefix) {
            return prefix && !otherPrefix ? false
                 : !prefix && otherPrefix ? true
                 : prefix === '*' && otherPrefix === '#' ? false
                 : prefix === '#' && otherPrefix === '*' ? true
                 :                                         new Error("Shouldn't happen!")
                 ;
        }
        else {
            return otherLength > length ? false
                 : otherLength < length ? true
                 :                        numeric > otherNumeric
                 ;
        }
    }
    
    _isGTE(other) {
        const { length, prefix, numeric } = this;
        const [ otherLength, otherPrefix, otherNumeric, otherValue ] = this._parse(other, true);
        
        if (this.value === otherValue) {
            return true;
        }
        else if (prefix !== otherPrefix) {
            return prefix && !otherPrefix ? false
                 : !prefix && otherPrefix ? true
                 : prefix === '*' && otherPrefix === '#' ? false
                 : prefix === '#' && otherPrefix === '*' ? true
                 :                                         new Error("Shouldn't happen!")
                 ;
        }
        else {
            return otherLength > length ? false
                 : otherLength < length ? true
                 :                        numeric >= otherNumeric
                 ;
        }
    }
    
    _isLT(other) {
        const { length, prefix, numeric } = this;
        const [ otherLength, otherPrefix, otherNumeric ] = this._parse(other);
        
        if (prefix !== otherPrefix) {
            return !prefix && otherPrefix ? false
                 : prefix && !otherPrefix ? true
                 : prefix === '*' && otherPrefix === '#' ? true
                 : prefix === '#' && otherPrefix === '*' ? false
                 :                                         new Error("Shouldn't happen!")
                 ;
        }
        else {
            return otherLength > length ? true
                 : otherLength < length ? false
                 :                        numeric < otherNumeric
                 ;
        }
    }
    
    _isLTE(other) {
        const { length, prefix, numeric } = this;
        const [ otherLength, otherPrefix, otherNumeric, otherValue ] = this._parse(other, true);
        
        if (this.value === otherValue) {
            return true;
        }
        else if (prefix !== otherPrefix) {
            return !prefix && otherPrefix ? false
                 : prefix && !otherPrefix ? true
                 : prefix === '*' && otherPrefix === '#' ? true
                 : prefix === '#' && otherPrefix === '*' ? false
                 :                                         new Error("Shouldn't happen!")
                 ;
        }
        else {
            return otherLength > length ? true
                 : otherLength < length ? false
                 :                        numeric < otherNumeric
                 ;
        }
    }
    
    next() {
        const valueLen = this.length;
        const prefixLen = this.prefix.length;
        const _next = String(this.numeric + 1);
        
        if ((_next.length + prefixLen) >= valueLen) {
            return this.prefix + _next;
        }
        
        // Can't do this every time: padStart will *trim* the string to specified length!
        // Talk about sane API.
        return this.prefix + _next.padStart(valueLen - prefixLen, '0');
    }
    
    prev() {
        const valueLen = this.length;
        const prefixLen = this.prefix.length;
        let _prev = this.numeric - 1;
        
        // There's no sane way to decrement digit strings below 0
        if (_prev < 0) {
            return null;
        }
        
        _prev = String(_prev);
        
        if ((_prev.length + prefixLen) >= valueLen) {
            return this.prefix + _prev;
        }
        
        return this.prefix + _prev.padStart(valueLen - prefixLen, '0');
    }
}

module.exports = DigitStringBox;
