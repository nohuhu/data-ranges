const path = require('path');

const ucfirst = (str) => {
    const chars = (str || '').toLowerCase().split('');
    
    chars[0] = (chars[0] || '').toUpperCase();
    
    return chars.join('');
}

const _separatorRe = /\s*[,;]\s*/;

class Range {
    static create(config) {
        const { type } = config || {};
        
        let classPath, ctor;
        
        try {
            classPath = path.join(__dirname, type);
            ctor = require(classPath);
        }
        catch (e) {
            // ignore
        }
        
        if (!ctor) {
            try {
                classPath = path.join(__dirname, ucfirst(type));
                ctor = require(classPath);
            }
            catch (e) {
                // ignore too
            }
        }
        
        if (!ctor) {
            throw new Error("Invalid range type: " + type);
        }
        
        return ctor(config);
    }
    
    constructor(items) {
        this._range = new Set();
        this._size = 0;
        
        this.add(items);
    }
    
    add(items) {
        const validated = this.validateAndExpand(items);
        const existing = this._explode(this._range);
        
        for (let item of validated) {
            existing.add(item);
        }
        
        this._range = new Set(this._collapseRange(existing));
        this._size = existing.size;
        
        return this;
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
    
    get patternRe() {
        throw new Error("patternRe getter should be implemented in a subclass.");
    }
    
    get rangeSeparator() {
        throw new Error("rangeSeparator getter should be implemented in a subclass.");
    }
    
    get rangeRe() {
        throw new Error("rangeRe getter should be implemented in a subclass.");
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
    
    _has(items, wantList) {
        const validated = this.validateAndExpand(items);
        const existing = this._explode(this._range);
        const missing = new Set();
        
        for (let item of validated) {
            if (!existing.has(item)) {
                if (wantList) {
                    missing.add(item);
                }
                else {
                    return false;
                }
            }
        }
        
        return wantList ? [...missing] : missing.size === 0;
    }
    
    validateAndExpand(items) {
        items = (items instanceof Set) || Array.isArray(items) ? [...items] : [items];
        
        if (!items.length) {
            return items;
        }
        
        const separatorRe = this.itemSeparatorRe;
        const rangeRe = this.rangeRe;
        
        const range = new Set();
        
        while (items.length) {
            const item = items.shift();
            
            if (separatorRe.test(item)) {
                Array.prototype.splice.apply(items, [].concat(0, 0, item.split(separatorRe)));
                
                continue;
            }
            
            if (!this.validateItem(item)) {
                throw new Error(`Invalid input: ${item}`);
            }
            
            const match = rangeRe.exec(item);
            
            if (match) {
                const { from, to } = match.groups || {};
                const expanded = this.expand(from, to);
                
                for (let expItem of expanded) {
                    range.add(expItem);
                }
            }
            else {
                range.add(this.convertItem(item));
            }
        }
        
        return range;
    }
    
    validateItem(item) {
        if (item == null || item === '' || !this.patternRe.test(item)) {
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
        return this.valueOf().join(this.itemSeparator);
    }
    
    collapse(itemSeparator) {
        const collapsed = [];
        
        for (let element of this._range) {
            collapsed.push(typeof element === 'object' ? this._stringify(element) : element);
        }
        
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
        return [element.start, element.end].join(this.rangeSeparator);
    }
    
    equals(a, b) {
        throw new Error("equals() should be implemented in a subclass.");
    }
    
    nextInRange(a, b) {
        throw new Error("nextInRange() should be implemented in a subclass.");
    }
}

module.exports = Range;
