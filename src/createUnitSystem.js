const Unit = require('./Unit');
const UnitSystem = require('./UnitSystem');
const createMeasurement = require('./createMeasurement');

function createUnitSystem(units) {
  const system = new UnitSystem(units);

  function createUnit(name, options) {
    const unit = new Unit(name);
    system.register(unit, options);
    return unit;
  }

  const convert = (...args) => system.convert(...args);

  const m = createMeasurement(system);

  return { m, createUnit, convert, system };
}

module.exports = createUnitSystem;
