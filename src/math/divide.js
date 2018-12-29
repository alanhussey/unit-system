const Measurement = require('../Measurement');

function _divide(dividend, divisor) {
  return dividend / divisor;
}

function divide(dividend, divisor) {
  if (dividend == null || divisor == null) {
    throw new TypeError('Cannot divide a Measurement with nothing');
  }
  if (!(dividend instanceof Measurement)) {
    throw new TypeError('Expected a Measurement but got none');
  }
  if (!(divisor instanceof Measurement)) {
    return new Measurement(_divide(dividend.value, divisor), dividend.unit);
  }
  if (dividend.unit !== divisor.unit) {
    throw new TypeError('Cannot divide two Measurements with different units');
  }
  return _divide(dividend.value, divisor.value);
}

module.exports = divide;
