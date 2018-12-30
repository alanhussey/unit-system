const Converter = require('./Converter');
const withAliases = require('./withAliases');

class SlopeIntercept extends Converter {
  constructor(slope, intercept = 0) {
    super(slope, intercept);
    this.slope = slope;
    this.intercept = intercept;
  }
  forward(value) {
    return value * this.slope + this.intercept;
  }
  backward(value) {
    return (value - this.intercept) / this.slope;
  }
}

function slopeIntercept(slope, intercept) {
  return new SlopeIntercept(slope, intercept);
}

exports.SlopeIntercept = SlopeIntercept;
exports.slopeIntercept = slopeIntercept;
withAliases(exports, slopeIntercept, 'multiplyBy', 'times');
