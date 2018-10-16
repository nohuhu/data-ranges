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
        return this.value && this.value.toString ? this.value.toString() : this.value + '';
    }
    
    equals(other) {
        if (typeof other === 'object' && ('start' in other) && ('end' in other)) {
            return other.start.equals(this.value) && other.end.equals(this.value);
        }
        
        return this.value === (other instanceof Box ? other.value : other);
    }
    
    isGreaterThan(other) {
        if (typeof other === 'object' && ('start' in other) && ('end' in other)) {
            return other.end.isLesserThan(this.value);
        }
        
        return this.value > (other instanceof Box ? other.value : other);
    }
    
    isLesserThan(other) {
        if (typeof other === 'object' && ('start' in other) && ('end' in other)) {
            return other.start.isGreaterThan(this.value);
        }
        
        return this.value < (other instanceof Box ? other.value : other)
    }
    
    next() {
        throw new Error("next() should be implemented in a Box superclass");
    }
    
    prev() {
        throw new Error("prev() should be implemented in a Box superclass");
    }
}

module.exports = Box;
