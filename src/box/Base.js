class Box {
    constructor(value) {
        this.value = value;
    }
    
    clone() {
        return new this.constructor(this.value);
    }
    
    get size() {
        return 1;
    }
    
    valueOf() {
        return this.value;
    }
    
    toString() {
        const value = this.value;
        
        return value && value.toString ? value.toString() : value + '';
    }
    
    equals(other) {
        const value = this.value;
        
        if (typeof other === 'object' && ('start' in other) && ('end' in other)) {
            return other.start.equals(value) && other.end.equals(value);
        }
        
        return this._equals(other);
    }
    
    _equals(other) {
        return this.value === (other instanceof Box ? other.value : other);
    }
    
    isGreaterThan(other) {
        if (typeof other === 'object' && ('start' in other) && ('end' in other)) {
            return other.end.isLesserThan(this.value);
        }
        
        return this._isGT(other);
    }
    
    _isGT(other) {
        return this.value > (other instanceof Box ? other.value : other);
    }
    
    isGTE(other) {
        const value = this.value;
        
        if (typeof other === 'object' && ('start' in other) && ('end' in other)) {
            return other.end.isLesserThan(value) ||
                   (other.start.equals(value) && other.end.equals(value));
        }
        
        return this._isGTE(other);
    }
    
    _isGTE(other) {
        return this.value >= (other instanceof Box ? other.value : other);
    }
    
    isLesserThan(other) {
        if (typeof other === 'object' && ('start' in other) && ('end' in other)) {
            return other.start.isGreaterThan(this.value);
        }
        
        return this._isLT(other);
    }
    
    _isLT(other) {
        return this.value < (other instanceof Box ? other.value : other);
    }
    
    isLTE(other) {
        const value = this.value;
        
        if (typeof other === 'object' && ('start' in other) && ('end' in other)) {
            return other.start.isGreaterThan(value) ||
                   (other.start.equals(value) && other.end.equals(value));
        }
        
        return this._isLTE(other);
    }
    
    _isLTE(other) {
        return this.value <= (other instanceof Box ? other.value : other);
    }
    
    next() {
        throw new Error("next() should be implemented in a child class");
    }
    
    prev() {
        throw new Error("prev() should be implemented in a child class");
    }
}

module.exports = Box;
