const Box = require('./Base');

class IntegerBox extends Box {
    next() {
        return this.value + 1;
    }
    
    prev() {
        return this.value - 1;
    }
}

module.exports = IntegerBox;
