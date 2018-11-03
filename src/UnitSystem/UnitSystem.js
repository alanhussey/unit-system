const Aliases = require('./Aliases');

class UnitSystem {
  constructor(units = []) {
    this._aliases = new Aliases();

    units.forEach(([unit, options]) => {
      this.register(unit, options);
    });
  }
  register(unit, { alias }) {
    const aliases = [].concat(alias);
    aliases.forEach(alias => {
      this._aliases.add(alias, unit);
    });
  }
  getUnitForAlias(alias) {
    return this._aliases.get(alias);
  }
}

module.exports = UnitSystem;
