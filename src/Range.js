const path = require('path');

const ucfirst = (str) => {
    const chars = (str || '').toLowerCase().split('');
    
    chars[0] = (chars[0] || '').toUpperCase();
    
    return chars.join('');
}

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
        
        this.add(items);
    }
    
    add(items) {
        const validated = this.validateAndExpand(items);
        
        for (let item of validated) {
            for (let existing of this._range) {
                
            }
            this._range.add(item);
        }
        
        return this;
    }
    
    remove(items) {
        const validated = this._validateAndExpand(items);
        
        for (let item of validated) {
            this._range.delete(item);
        }
        
        return this;
    }
    
    get size() {
        return this._range.size;
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
    
    get rangeRe() {
        throw new Error("rangeRe getter should be implemented in a subclass.");
    }
    
    explode(item) {
        throw new Error("explode() should be implemented in a subclass.");
    }
    
    _has(items, wantList) {
        const validated = this.validateAndExpand(items);
        const missing = new Set();
        
        for (let item of validated) {
            if (!this._range.has(item)) {
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
        
        const separatorRe = this.separatorRe;
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
                const exploded = this.explode(from, to);
                
                for (let expItem of exploded) {
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
}

Range.prototype.separatorRe = /\s*[,;]\s*/;

module.exports = Range;
