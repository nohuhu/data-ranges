const path = require('path');
const BaseRange = require('./range/Base');

const ucfirst = (str) => {
    const chars = (str || '').toLowerCase().split('');
    
    chars[0] = (chars[0] || '').toUpperCase();
    
    return chars.join('');
}

const _separatorRe = /\s*[,;]\s*/;

class RangeSet {
    constructor(Range, values) {
        if (typeof Range === 'string') {
            Range = require(path.join(__dirname, 'range', ucfirst(Range.toLowerCase())));
        }
        
        if (typeof Range !== 'function') {
            throw new Error("Range constructor is required as first argument");
        }
        
        this.Range = Range;
        this._values = [];
        this._size = 0;
        
        if (arguments.length > 1) {
            this.add(values);
        }
    }
    
    add(values) {
        const validated = this.validate(values);
        
        for (let value of validated) {
            let { range, index } = this._find(value);
            
            if (range instanceof BaseRange) {
                this._absorb(range, index, value);
            }
            else {
                this._values.splice(index, 0, value);
                this._size += value.size;
            }
        }
        
        return this;
    }
    
    remove(values) {
        const validated = this.validate(values);
        const existing = this._values;
        
        for (let value of validated) {
            for (let i = 0; i < existing.length;) {
                const range = existing[i];
                
                const sizeWas = this._size - range.size;
                const remaining = range.remove(value);
                
                if (remaining.length === 1 && remaining[0] === range) {
                    i++;
                }
                else {
                    const sizeIs = remaining.reduce((acc, item) => (acc + item.size), 0);
                    
                    existing.splice(i, 1, ...remaining);
                    this._size = sizeWas + sizeIs;
                    
                    i += remaining.length === 0 ? 0 : remaining.length - 1;
                }
            }
        }
        
        return this;
    }
    
    _absorb(range, index, value) {
        const values = this._values;
        
        let sizeWas = this._size - range.size;
        range.absorb(value);
        this._size = sizeWas + range.size;
        
        for (let i = 0; i < values.length;) {
            let current = values[i];
            
            if (current !== range && range.relatedTo(current)) {
                sizeWas = this._size - range.size - current.size;
                
                values.splice(i, 1);
                range.absorb(current);
                
                this._size = sizeWas + range.size;
                
                continue;
            }
            
            i++;
        }
    }
    
    _find(value, strict) {
        const values = this._values,
              lastIndex = values.length - 1,
              firstValue = values[0],
              lastValue = values[lastIndex],
              method = strict ? 'contains' : 'relatedTo';
        
        // Optimize trivial cases
        if (values.length === 0) {
            return { index: 0 };
        }
        // Most often values are added sequentially so it makes sense to test the end first
        else if (lastValue[method](value)) {
            return { index: lastIndex, range: lastValue };
        }
        else if (lastValue.end.isLesserThan(value.start)) {
            return { index: values.length };
        }
        else if (firstValue[method](value)) {
            return { index: 0, range: firstValue };
        }
        else if (firstValue.start.isGreaterThan(value.end)) {
            return { index: 0 };
        }
        else if (values.length === 2) {
            return { index: 1 };
        }
        
        let startIndex = 0,
            finishIndex = values.length - 1,
            midIndex, startValue, finishValue, midValue;
        
        while (startIndex !== finishIndex) {
            startValue = values[startIndex];
            finishValue = values[finishIndex];
            
            midIndex = startIndex + Math.ceil((finishIndex - startIndex) / 2);
            midValue = values[midIndex];
            
            if (midValue[method](value)) {
                return { index: midIndex, range: midValue };
            }
            else if (midValue.start.isGreaterThan(value)) {
                if (midIndex === 0) {
                    return { index: 0 };
                }
                
                // Check if the range immediately preceeding the mid is related
                // or the value falls between preceeding range and the mid. In that case
                // we've found the index.
                const prevIndex = midIndex - 1;
                const prevValue = values[prevIndex];
                
                if (prevValue[method](value)) {
                    return { index: prevIndex, range: prevValue };
                }
                else if (prevValue.end.isLesserThan(value)) {
                    return { index: prevIndex };
                }
                
                finishIndex = midIndex;
            }
            else if (midValue.end.isLesserThan(value)) {
                if (midIndex >= (values.length - 1)) {
                    return { index: values.length };
                }
                
                // Check if the range immediately following the mid is related
                // or the value falls between mid and next.
                const nextIndex = midIndex + 1;
                const nextValue = values[nextIndex];
                
                if (nextValue[method](value)) {
                    return { index: nextIndex, range: nextValue };
                }
                else if (nextValue.start.isGreaterThan(value)) {
                    return { index: nextIndex };
                }
                
                startIndex = midIndex;
            }
        }
    }
    
    get size() {
        return this._size;
    }
    
    contains(items) {
        return this._has(items, false);
    }
    
    containsAll(items) {
        return this._has(items, true);
    }
    
    get itemSeparator() {
        return ',';
    }
    
    get itemSeparatorRe() {
        return _separatorRe;
    }
    
    expand(item) {
        throw new Error("expand() should be implemented in a subclass.");
    }
    
    _has(values, wantList) {
        const validated = this.validate(values);
        const existing = this._values;
        const missing = new Set();
        
        for (let value of validated) {
            const related = this._find(value, true);
            
            if (!(related instanceof BaseRange)) {
                if (wantList) {
                    missing.add(value.valueOf());
                }
                else {
                    return false;
                }
            }
        }
        
        return wantList ? [...missing] : missing.size === 0;
    }
    
    validate(values) {
        values = (values instanceof Set) || Array.isArray(values) ? [...values] : [values];
        
        if (!values.length) {
            return values;
        }
        
        const separatorRe = this.itemSeparatorRe;
        const rangeRe = this.Range.rangeRe;
        
        const validated = [];
        
        while (values.length) {
            const value = values.shift();
            
            if (value instanceof BaseRange) {
                if (value instanceof this.Range) {
                    validated.push(value);
                    
                    continue;
                }
                else {
                    throw new Error("Cannot mix different Range types in the same set!");
                }
            }
            
            if (separatorRe.test(value)) {
                Array.prototype.splice.apply(values, [].concat(0, 0, value.split(separatorRe)));
                
                continue;
            }
            
            if (!this.validateValue(value)) {
                throw new Error(`Invalid input: ${value}`);
            }
            
            const match = rangeRe.exec(value);
            
            if (match) {
                const { from, to } = match.groups || {};
                
                validated.push(new this.Range(from, to));
            }
            else {
                validated.push(new this.Range(value));
            }
        }
        
        return validated;
    }
    
    validateValue(value) {
        if (value == null || value === '' || !this.Range.patternRe.test(value)) {
            return false;
        }
        
        return true;
    }
    
    toString() {
        const values = this._values.map(value => value.toString());
        
        return values.join(this.itemSeparator);
    }
    
    *by(precision, options) {
        const values = [...this._values];
        
        while (values.length) {
            const value = values.shift();
            
            yield *value.by(precision, options);
        }
    }
}

module.exports = RangeSet;
