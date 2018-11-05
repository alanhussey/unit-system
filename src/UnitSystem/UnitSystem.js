const Measurement = require('../Measurement');
const Unit = require('../Unit');
const Aliases = require('./Aliases');
const Converters = require('./Converters');

class UnitSystem {
  constructor(units = []) {
    this._aliases = new Aliases();
    this._converters = new Converters();

    units.forEach(([unit, options]) => {
      this.register(unit, options);
    });
  }
  register(unit, options = {}) {
    const { alias, convert } = Object.assign({ alias: [] }, options);

    const aliases = [].concat(alias);
    aliases.forEach(alias => {
      this._aliases.add(alias, unit);
    });

    if (convert) {
      if (convert.from) {
        const [startUnit, converter] = convert.from;
        this._converters.add(startUnit, unit, converter);
      }
      if (convert.to) {
        const [endUnit, converter] = convert.to;
        this._converters.add(unit, endUnit, converter);
      }
    }
  }
  getUnitForAlias(alias) {
    return this._aliases.get(alias);
  }

  convert(measurement, endUnit) {
    if (!(measurement instanceof Measurement)) {
      throw new TypeError(
        `Expected a Measurement, got "${JSON.stringify(measurement)}" instead`
      );
    }
    if (!(endUnit instanceof Unit)) {
      throw new TypeError('Expected a Unit, got "{"name":"inch"}" instead');
    }
    if (measurement.unit === endUnit) {
      return measurement;
    }
    const convert = this._converters.find(measurement.unit, endUnit);
    if (!convert) {
      throw new TypeError(
        `Unable to find a converter from ${measurement.unit.name} to ${
          endUnit.name
        }`
      );
    }
    return new Measurement(convert(measurement.value), endUnit);
  }
}

module.exports = UnitSystem;
