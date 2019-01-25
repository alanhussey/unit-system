const Unit = require('./Unit');
const UnitSystem = require('./UnitSystem');
const createMeasurement = require('./createMeasurement');

function bound(obj, method) {
  return obj[method].bind(obj);
}

function createUnitSystem(units) {
  const system = new UnitSystem(units);

  function createUnit(name, options) {
    const unit = new Unit(name);
    system.register(unit, options);
    return unit;
  }

  const convert = bound(system, 'convert');

  const add = bound(system, 'add');
  const subtract = bound(system, 'subtract');
  const multiply = bound(system, 'multiply');
  const divide = bound(system, 'divide');

  const equal = bound(system, 'equal');
  const lessThan = bound(system, 'lessThan');
  const lessThanOrEqual = bound(system, 'lessThanOrEqual');
  const greaterThan = bound(system, 'greaterThan');
  const greaterThanOrEqual = bound(system, 'greaterThanOrEqual');

  const m = createMeasurement(system);

  return {
    m,
    createUnit,
    convert,
    add,
    subtract,
    multiply,
    divide,
    equal,
    lessThan,
    lessThanOrEqual,
    greaterThan,
    greaterThanOrEqual,
    system,
  };
}

module.exports = createUnitSystem;
