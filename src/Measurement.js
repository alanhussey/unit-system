const Unit = require('./Unit');

function throwMissingArgError(arg, value, unit) {
  throw new TypeError(
    `new Measurement(value, unit) requires a ${arg}, got (${JSON.stringify(
      value
    )}, ${JSON.stringify(unit)}) instead`
  );
}

const VALUE = Symbol('value');
const UNIT = Symbol('unit');

class Measurement {
  constructor(value, unit) {
    if (value == null) {
      throwMissingArgError('value', value, unit);
    }
    if (!(unit instanceof Unit)) {
      throwMissingArgError('unit', value, unit);
    }
    this[VALUE] = value;
    this[UNIT] = unit;
  }
  get value() {
    return this[VALUE];
  }
  get unit() {
    return this[UNIT];
  }
}

module.exports = Measurement;
