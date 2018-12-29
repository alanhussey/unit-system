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

  const m = createMeasurement(system);

  return { m, createUnit, convert, add, subtract, multiply, divide, system };
}

module.exports = createUnitSystem;
