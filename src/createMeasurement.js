const Unit = require('./Unit');
const Measurement = require('./Measurement');

function createMeasurement(system) {
  function createAliasLookupObject(value) {
    return new Proxy(Object.create(null), {
      get(target, alias) {
        const unit = system.getUnitForAlias(alias);
        return new Measurement(value, unit);
      },
    });
  }

  return function m(value, unit) {
    if (Array.isArray(value)) {
      const [valueStr, alias] = value[0].split(' ');
      const v = Number(valueStr);
      const u = unit || system.getUnitForAlias(alias);
      return m(v, u);
    }

    if (!(unit instanceof Unit)) {
      return createAliasLookupObject(value);
    }
    return new Measurement(value, unit);
  };
}

module.exports = createMeasurement;
