const Box = require('./Base');

class DigitStringBox extends Box {
    constructor(value) {
        super(value);
        
        [this.prefix, this.numeric] = this._parse(value);
    }
    
    _parse(value) {
        value = value instanceof Box ? value.valueOf() : value;
        
        return /^[#*]/.test(value) ? [value.substr(0, 1), value.substr(1)] : [null, value];
    }
    
    toString() {
        return this.value;
    }
    
    _isGT(other) {
        let { prefix, numeric } = this;
        let [ otherPrefix, otherNumeric ] = this._parse(other);
        
        // *123 < #123 < 123
        if (prefix === '*') {
            return otherPrefix === '*' ? numeric > otherNumeric : false;
        }
        else if (prefix === '#') {
            return !otherPrefix ? false : otherPrefix === '*' ? true : numeric > otherNumeric;
        }
        else {
            return otherPrefix ? true : numeric > otherNumeric;
        }
    }
    
    _isGTE(other) {
        let { prefix, numeric } = this;
        let [ otherPrefix, otherNumeric ] = this._parse(other);
        
        if (prefix === '*') {
            return otherPrefix === '*' ? numeric >= otherNumeric : false;
        }
        else if (prefix === '#') {
            return !otherPrefix ? false : otherPrefix === '*' ? true : numeric >= otherNumeric;
        }
        else {
            return otherPrefix ? true : numeric >= otherNumeric;
        }
    }
    
    _isLT(other) {
        let { prefix, numeric } = this;
        let [ otherPrefix, otherNumeric ] = this._parse(other);
        
        if (prefix === '*') {
            return otherPrefix === '*' ? numeric < otherNumeric : true;
        }
        else if (prefix === '#') {
            return !otherPrefix ? true : otherPrefix === '*' ? false : numeric < otherNumeric;
        }
        else {
            return otherPrefix ? false : numeric < otherNumeric;
        }
    }
    
    _isLTE(other) {
        let { prefix, numeric } = this;
        let [ otherPrefix, otherNumeric ] = this._parse(other);
        
        if (prefix === '*') {
            return otherPrefix === '*' ? numeric <= otherNumeric : true;
        }
        else if (prefix === '#') {
            return !otherPrefix ? true : otherPrefix === '*' ? false : numeric <= otherNumeric;
        }
        else {
            return otherPrefix ? false : numeric <= otherNumeric;
        }
    }
    
    next() {
        const targetLen = this.value.length;
        const _next = String(this.numeric + 1);
        
        return _next.length > targetLen ? _next : _next.leftPad(targetLen, '0');
    }
    
    prev() {
        const targetLen = this.value.length;
        const _prev = this.numeric - 1;
        
        if (_prev < 0) {
            throw new Error(`Cannot calculate previous value for ${this.value}!`);
        }
        
        return String(_prev).leftPad(targetLen, '0');
    }
}

module.exports = DigitStringBox;
