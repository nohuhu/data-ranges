class Box {
    constructor(value) {
        this.value = value;
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
        return this.value === (other instanceof Box ? other.value : other);
    }
    
    isGreaterThan(other) {
        return this.value > (other instanceof Box ? other.value : other);
    }
    
    isLesserThan(other) {
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
