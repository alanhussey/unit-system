const { add, subtract, multiply, divide } = require('../math');
const createAliasedMeasurementProxy = require('../createAliasedMeasurementProxy');
const Measurement = require('../Measurement');
const Unit = require('../Unit');
const Aliases = require('./Aliases');
const Converters = require('./Converters');

class UnitSystem {
  constructor(units = []) {
    this._units = [];
    this._aliases = new Aliases();
    this._converters = new Converters();

    const system = this;
    this.SystemMeasurement = class SystemMeasurement extends Measurement {
      get in() {
        return createAliasedMeasurementProxy(system, unit =>
          system.convert(this, unit)
        );
      }
      as(unit) {
        return system.convert(this, unit);
      }
    };

    this.registerAll(units);
  }

  merge(...otherSystems) {
    if (
      otherSystems.some(otherSystem => !(otherSystem instanceof UnitSystem))
    ) {
      throw new TypeError(
        `Expected a UnitSystem but got "${JSON.stringify(
          otherSystems
        )}" instead`
      );
    }

    otherSystems.forEach(system => {
      system._units.forEach(unit => {
        this.register(...unit);
      });
    });
  }

  register(unit, options = {}) {
    this._units.push([unit, options]);
    const { alias, convert } = Object.assign({ alias: [] }, options);

    const aliases = [].concat(alias);
    aliases.forEach(alias => {
      this._aliases.add(alias, unit);
    });

    if (convert) {
      if (convert.from) {
        const [startUnit, converter] = convert.from;
        this.addConverter(startUnit, unit, converter);
      }
      if (convert.to) {
        const [endUnit, converter] = convert.to;
        this.addConverter(unit, endUnit, converter);
      }
    }
  }

  registerAll(units) {
    units.forEach(unit => this.register(...unit));
  }

  addConverter(startUnit, endUnit, converter) {
    if (!this._units.find(([u]) => u === startUnit)) {
      throw new Error(
        `Cannot add a converter for a unit that has not been registered yet (${
          startUnit.name
        } is not registered)`
      );
    }
    this._converters.add(startUnit, endUnit, converter);
  }

  getUnitForAlias(alias) {
    return this._aliases.get(alias);
  }

  convert(measurement, endUnitOrAlias) {
    if (!(measurement instanceof Measurement)) {
      throw new TypeError(
        `Expected a Measurement, got "${JSON.stringify(measurement)}" instead`
      );
    }
    let endUnit = endUnitOrAlias;
    if (typeof endUnitOrAlias === 'string') {
      endUnit = this.getUnitForAlias(endUnitOrAlias);
      if (!endUnit) {
        throw new Error(
          `Unit matching alias "${endUnitOrAlias}" does not exist`
        );
      }
    }
    if (!(endUnit instanceof Unit)) {
      throw new TypeError(
        `Expected a Unit, got "${JSON.stringify(endUnit)}" instead`
      );
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
    const { SystemMeasurement } = this;
    return new SystemMeasurement(convert(measurement.value), endUnit);
  }

  _normalizeUnits(measurements) {
    const firstMeasurement = measurements.find(
      measurement => measurement instanceof Measurement
    );
    const unit = firstMeasurement.unit;
    return measurements.map(
      measurement =>
        measurement instanceof Measurement
          ? this.convert(measurement, unit)
          : measurement
    );
  }
  add(...measurements) {
    return add(...this._normalizeUnits(measurements));
  }
  subtract(...measurements) {
    return subtract(...this._normalizeUnits(measurements));
  }
  multiply(...values) {
    return multiply(...values);
  }
  divide(...values) {
    return divide(...this._normalizeUnits(values));
  }
}

module.exports = UnitSystem;
