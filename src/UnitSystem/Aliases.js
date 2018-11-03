const Unit = require('../Unit');

class Aliases extends Map {
  set(alias, unit) {
    if (typeof alias !== 'string') {
      throw new TypeError(
        `Alias must be a string - got "${JSON.stringify(alias)}" instead`
      );
    }
    if (!(unit instanceof Unit)) {
      throw new TypeError(
        `Aliased unit must be a Unit instance - got "${JSON.stringify(
          unit
        )}" instead`
      );
    }
    return super.set(alias, unit);
  }

  add(...args) {
    return this.set(...args);
  }

  has(alias, unit) {
    return super.has(alias) && super.get(alias) === unit;
  }
}

module.exports = Aliases;
