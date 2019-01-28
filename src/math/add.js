const measurementsHaveSameUnit = require('./measurementsHaveSameUnit');
const Measurement = require('../Measurement');

function _add(measurements) {
  return measurements.reduce(
    (total, measurement) => total + measurement.value,
    0
  );
}

function add(...measurements) {
  if (measurements.length === 0) {
    throw new TypeError('Expected at least 2 Measurements but got none');
  }
  if (measurements.length === 1) {
    return measurements[0];
  }
  if (!measurementsHaveSameUnit(measurements)) {
    const units = Array.from(new Set(measurements.map(m => m.unit.name)));
    throw new TypeError(
      `Cannot add measurements with different units: ${units.join(', ')}`
    );
  }
  const unit = measurements[0].unit;
  return new Measurement(_add(measurements), unit);
}

module.exports = add;
