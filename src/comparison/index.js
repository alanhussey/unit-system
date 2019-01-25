const Measurement = require('../Measurement');

function compare(comparisonFn) {
  return (left, right) => {
    if (!(left instanceof Measurement)) {
      throw new TypeError(
        `Expected a Measurement but got ${JSON.stringify(left)} instead`
      );
    }
    if (!(right instanceof Measurement)) {
      throw new TypeError(
        `Expected a Measurement but got ${JSON.stringify(right)} instead`
      );
    }
    if (left.unit !== right.unit) {
      throw new TypeError('Measurements must be of the same unit');
    }
    return comparisonFn(left.value, right.value);
  };
}

exports.equal = compare((left, right) => left === right);
exports.lessThan = compare((left, right) => left < right);
exports.lessThanOrEqual = compare((left, right) => left <= right);
exports.greaterThan = compare((left, right) => left > right);
exports.greaterThanOrEqual = compare((left, right) => left >= right);
