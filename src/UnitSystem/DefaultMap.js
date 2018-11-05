class DefaultMap extends Map {
  constructor(defaultFn, ...args) {
    super(...args);
    this._getDefaultValue = defaultFn;
  }

  get(key) {
    if (!this.has(key)) {
      this.set(key, this._getDefaultValue());
    }
    return super.get(key);
  }
}

module.exports = DefaultMap;
