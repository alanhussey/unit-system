const measurementsHaveSameUnit = require('./measurementsHaveSameUnit');
const Measurement = require('../Measurement');

function subtract(...measurements) {
  if (measurements.length < 1 || measurements.length > 2) {
    throw new TypeError(
      `Expected exactly 2 Measurements but got ${measurements.length}`
    );
  }
  if (measurements.length === 1) {
    return measurements[0];
  }
  if (!measurementsHaveSameUnit(measurements)) {
    throw new TypeError('Cannot subtract measurements with different units');
  }
  const unit = measurements[0].unit;
  return new Measurement(measurements[0].value - measurements[1].value, unit);
}

module.exports = subtract;
