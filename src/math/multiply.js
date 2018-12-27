const Measurement = require('../Measurement');

function _multiply(...numbers) {
  return numbers.reduce((total, number) => total * number, 1);
}

function multiply(...values) {
  const measurements = values.filter(value => value instanceof Measurement);
  if (measurements.length === 0) {
    throw new TypeError('Expected a Measurement but got none');
  }
  if (measurements.length > 1) {
    throw new TypeError('Cannot multiply more than one Measurement');
  }
  const [measurement] = measurements;

  const numbers = values.filter(value => !(value instanceof Measurement));
  if (numbers.length === 0) {
    throw new TypeError('Cannot multiply a Measurement with nothing');
  }

  return new Measurement(
    _multiply(measurement.value, ...numbers),
    measurement.unit
  );
}

module.exports = multiply;
