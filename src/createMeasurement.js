const createAliasedMeasurementProxy = require('./createAliasedMeasurementProxy');
const Unit = require('./Unit');

function createMeasurement(system) {
  const { SystemMeasurement } = system;

  return function m(value, unit) {
    if (Array.isArray(value)) {
      const [valueStr, alias] = value[0].split(' ');
      const v = Number(valueStr);
      const u = unit || system.getUnitForAlias(alias);
      return m(v, u);
    }

    if (!(unit instanceof Unit)) {
      return createAliasedMeasurementProxy(
        system,
        unit => new SystemMeasurement(value, unit)
      );
    }
    return new SystemMeasurement(value, unit);
  };
}

module.exports = createMeasurement;
