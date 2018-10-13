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
            const related = this._find(value);
            
            if (related instanceof BaseRange) {
                let size = this._size - related.size;
                
                related.absorb(value);
                
                this._size = size + related.size;
            }
            else {
                this._values.splice(related, 0, value);
                this._size += value.size;
            }
        }
        
        return this;
    }
    
    _find(value, strict) {
        const values = this._values,
              lastIndex = values.length - 1,
              firstValue = values[0],
              lastValue = values[lastIndex],
              method = strict ? 'contains' : 'relatedTo';
        
        // Optimize trivial cases
        if (values.length === 0) {
            return 0;
        }
        // Most often values are added sequentially so it makes sense to test the end first
        else if (lastValue[method](value)) {
            return lastValue;
        }
        else if (lastValue.end.isLesserThan(value.start)) {
            return values.length;
        }
        else if (firstValue[method](value)) {
            return firstValue;
        }
        else if (firstValue.start.isGreaterThan(value.end)) {
            return 0;
        }
        else if (values.length === 2) {
            return 1;
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
                return midValue;
            }
            else if (midValue.start.isGreaterThan(value)) {
                if (midIndex === 0) {
                    return 0;
                }
                
                // Check if the range immediately preceeding the mid is related
                // or the value falls between preceeding range and the mid. In that case
                // we've found the index.
                const prevIndex = midIndex - 1;
                const prevValue = values[prevIndex];
                
                if (prevValue[method](value)) {
                    return prevValue;
                }
                else if (prevValue.end.isLesserThan(value)) {
                    return prevIndex;
                }
                
                finishIndex = midIndex;
            }
            else if (midValue.end.isLesserThan(value)) {
                if (midIndex >= (values.length - 1)) {
                    return values.length;
                }
                
                // Check if the range immediately following the mid is related
                // or the value falls between mid and next.
                const nextIndex = midIndex + 1;
                const nextValue = values[nextIndex];
                
                if (nextValue[method](value)) {
                    return nextValue;
                }
                else if (nextValue.start.isGreaterThan(value)) {
                    return nextIndex;
                }
                
                startIndex = midIndex;
            }
        }
    }
    
    remove(items) {
        const validated = this.validateAndExpand(items);
        const existing = this._explode(this._range);
        
        for (let item of validated) {
            existing.delete(item);
        }
        
        this._range = new Set(this._collapseRange(existing));
        this._size = existing.size;
        
        return this;
    }
    
    get size() {
        return this._size;
    }
    
    has(items) {
        return this._has(items, false);
    }
    
    hasItems(items) {
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
    
    convertItem(item) {
        throw new Error("convertItem() should be implemented in a subclass.");
    }
    
    valueOf() {
        return [...this._explode(this._range)].sort(this.sortFn);
    }
    
    toString() {
        return this.collapse();
    }
    
    collapse(itemSeparator) {
        const collapsed = this._values.map(value => value.toString());
        
//         for (let element of this._range) {
//             collapsed.push(typeof element === 'object' ? this._stringify(element) : element);
//         }
        
        return collapsed.join(this.itemSeparator);
    }
    
    sortFn() {
        throw new Error("sortFn() should be implemented in a subclass.");
    }
    
    _explode(range) {
        let result = [];
        
        for (let element of range) {
            if (typeof element === 'object') {
                const expanded = this.expand(element.start, element.end);
                
                result = [].concat(result, expanded);
            }
            else {
                result.push(element);
            }
        }
        
        return new Set(result);
    }
    
    _collapseRange(range) {
        let result = [],
            first, last, count;
        
        for (let item of this._sortRange(range)) {
            // If `first` is defined, it means a range has started
            if (first == null) {
                first = last = item;
                count = 1;
                
                continue;
            }
            
            // If `last` immediately preceeds the `item` in a range,
            // `item` becomes the next `last`
            if (this.nextInRange(last, item)) {
                last = item;
                count++;
                
                continue;
            }
            
            // If `item` doesn't follow `last` and `last` is defined,
            // this means the current contiguous range is complete
            if (!this.equals(first, last)) {
                result.push({
                    start: first,
                    end: last,
                    count,
                });
                
                first = last = item;
                count = 1;
                
                continue;
            }
            
            // If `last` wasn't defined, range was never contiguous
            result.push(first);
            
            first = last = item;
            count = 1;
        }
        
        // We get here when the last item has been processed
        const value = this.equals(first, last)
            ? first
            : { start: first, end: last, count };
        
        result.push(value);
        
        return result;
    }
    
    _sortRange(range) {
        return new Set([...range].sort(this.sortFn));
    }
    
    _stringify(element) {
        return [element.start, element.end].join(this.Range.rangeDelimiter);
    }
    
    equals(a, b) {
        throw new Error("equals() should be implemented in a subclass.");
    }
    
    nextInRange(a, b) {
        throw new Error("nextInRange() should be implemented in a subclass.");
    }
}

module.exports = RangeSet;
