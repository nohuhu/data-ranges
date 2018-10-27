const path = require('path');
const BaseRange = require('./range/Base');

const ucfirst = (str) => {
    if (!str || typeof str !== 'string') {
        return str;
    }
    
    return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
}

class RangeSet {
    constructor(options) {
        if (!options || typeof options !== 'object') {
            throw new Error("RangeSet options are required.");
        }
        
        let type = options.type;
        delete options.type;
        
        if (typeof type === 'string') {
            type = require(path.join(__dirname, 'range', ucfirst(type)));
        }
        
        if (typeof type !== 'function') {
            throw new Error("Range type or constructor is required");
        }
        
        this.Range = type;
        this.values = [];
        this.size = 0;
        
        this.options = { ...options };
        delete this.options.values;
        
        if ('values' in options) {
            this.add(options.values);
        }
    }
    
    add(values) {
        const validated = this.validate(values);
        
        for (let value of validated) {
            this._splice(value);
        }
        
        this._recount();
        
        return this;
    }
    
    union(values) {
        return this.add(values);
    }
    
    subtract(values) {
        const validated = this.validate(values);
        
        return this._subtract(validated);
    }
    
    _subtract(values) {
        for (let value of values) {
            this._delete(value);
        }
        
        this._recount();
        
        return this;
    }
    
    remove(values) {
        return this.subtract(values);
    }
    
    _find(value, method) {
        const values = this.values,
              lastIndex = values.length - 1,
              firstValue = values[0],
              lastValue = values[lastIndex];
        
        method = method || 'relatedTo';
        
        // Optimize trivial cases
        if (values.length === 0) {
            return { index: 0 };
        }
        // Most often values are added sequentially so it makes sense to test the end first
        else if (lastValue[method](value)) {
            return { index: lastIndex, range: lastValue };
        }
        else if (lastValue.end.isLesserThan(value)) {
            return { index: values.length };
        }
        else if (firstValue[method](value)) {
            return { index: 0, range: firstValue };
        }
        else if (firstValue.start.isGreaterThan(value)) {
            return { index: 0 };
        }
        else if (values.length === 2) {
            return { index: 1 };
        }
        
        let startIndex = 0,
            finishIndex = values.length - 1,
            midIndex, midValue;
        
        while (startIndex !== finishIndex) {
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
                    return { index: midIndex };
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
    
    _splice(value) {
        const values = this.values;
        
        if (values.length === 0) {
            values.push(value);
        }
        else if (values.length === 1) {
            const existing = values[0];
            
            if (existing.relatedTo(value)) {
                existing.absorb(value);
            }
            else if (value.end.isLesserThan(existing.start)) {
                values.unshift(value);
            }
            else {
                values.push(value);
            }
        }
        else {
            const singular = value.start.equals(value.end);
            
            const start = this._find(value.start);
            
            if (!start.range) {
                start.range = value;
                values.splice(start.index, 0, value);
                
                if (singular) {
                    return;
                }
            }
            else {
                while (start.index > 0 && values[start.index - 1].relatedTo(value.start)) {
                    start.index--;
                }
                
                start.range = values[start.index];
            }
            
            const end = singular ? { ...start } : this._find(value.end);
            
            if (end.range) {
                while (end.index < (values.length - 1) && 
                       values[end.index + 1].relatedTo(value.end)) {
                    end.index++;
                }
                
                end.range = values[end.index];
            }
            else if (end.index === start.index + 1) {
                end.index = start.index;
            }
            
            if (start.index === end.index) {
                start.range.absorb(value);
            }
            else {
                const ranges = values.splice(start.index, end.index - start.index + 1);
                ranges.forEach(range => value.absorb(range));
                values.splice(start.index, 0, value);
            }
        }
    }
    
    _delete(value) {
        const values = this.values;
        const singular = value.start.equals(value.end);
        
        if (values.length === 0) {
            return;
        }
        else if (values.length === 1) {
            const existing = values[0];
            
            if (existing.meets(value)) {
                const remaining = existing.remove(value);
                values.splice(0, 1, ...remaining);
            }
        }
        else {
            if (singular) {
                const found = this._find(value, 'meets');
                
                if (found && found.range) {
                    const remaining = found.range.remove(value);
                    values.splice(found.index, 1, ...remaining);
                }
            }
            else {
                const start = this._find(value.start, 'contains');
                const end = this._find(value.end, 'contains');
                
                if (!start.range && !end.range && start.index === end.index) {
                    return;
                }
                
                let affected = values.splice(start.index, end.index - start.index + 1);
                let remaining = [],
                    range;
                
                while (range = affected.shift()) {
                    remaining.push(...range.remove(value));
                }
                
                if (remaining.length) {
                    values.splice(start.index, 0, ...remaining);
                }
            }
        }
    }
    
    _recount() {
        this.size = this.values.reduce((acc, range) => (acc + range.size), 0);
    }
    
    has(values) {
        return this.contains(values);
    }
    
    contains(values) {
        const validated = this.validate(values);
        const existing = this.values;
        
        for (let value of validated) {
            const found = this._find(value, 'contains');
            
            if (!found || !found.range) {
                return false;
            }
        }
        
        return true;
    }
    
    containsAll(values) {
        const other = new this.constructor({ type: this.Range, values, ...this.options });
        
        return other._subtract(this.values);
    }
    
    validate(values) {
        values = (values instanceof Set) || Array.isArray(values) ? [...values] : [values];
        
        if (!values.length) {
            return values;
        }
        
        const options = this.options;
        const separatorRe = this.separatorRe;
        
        const validated = [];
        
        while (values.length) {
            const value = values.shift();
            const last = validated[validated.length - 1];
            
            if (value instanceof this.constructor) {
                validated.push(...value.values);
            }
            else if (value instanceof BaseRange) {
                if (value instanceof this.Range) {
                    validated.push(value);
                }
                else {
                    throw new Error("Cannot mix different Range types in the same set!");
                }
            }
            else {
                // This will throw if something is wrong
                validated.push(...this.Range.factory({ values: value, options }));
            }
        }
        
        return validated;
    }
    
    toString() {
        if (!this.values.length) {
            return '';
        }
        
        // TODO This is a bit kludgy :(
        const separator = this.options.separator || this.values[0].separator;
        const values = this.values.map(value => value.toString());
        
        return values.join(separator);
    }
    
    *by(precision, options) {
        const values = [...this.values];
        
        while (values.length) {
            const value = values.shift();
            
            yield *value.by(precision, options);
        }
    }
}

module.exports = RangeSet;
