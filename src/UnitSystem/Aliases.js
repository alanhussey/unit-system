const Unit = require('../Unit');

const str = JSON.stringify;

class Aliases extends Map {
  set(alias, unit) {
    if (typeof alias !== 'string') {
      throw new TypeError(
        `Alias must be a string - got "${str(alias)}" instead`
      );
    }
    if (!(unit instanceof Unit)) {
      throw new TypeError(
        `Aliased unit must be a Unit instance - got "${str(unit)}" instead`
      );
    }
    if (super.has(alias)) {
      const existing = this.get(alias);
      if (existing !== unit) {
        throw new Error(
          `Cannot register "${str(
            unit
          )}" under the alias "${alias}" - that alias is already taken by "${str(
            existing
          )}"`
        );
      }
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
