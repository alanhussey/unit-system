const Converter = require('./Converter');

class DivideBy extends Converter {
  constructor(divisor) {
    super(divisor);
    this.divisor = divisor;
  }
  forward(value) {
    return value / this.divisor;
  }
  backward(value) {
    return value * this.divisor;
  }
}

function divideBy(divisor) {
  return new DivideBy(divisor);
}

exports.divideBy = divideBy;
