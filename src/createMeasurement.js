const Unit = require('./Unit');
const Measurement = require('./Measurement');

const POSSIBLE_VALUE_AND_OPTIONAL_ALIAS_RE = /^(-?[\d\.\,]+)\s*(.+)?$/;
const STRICT_VALUE_RE = /^-?((\d{1,3}(,\d{3})+)|(\d+))?(\.\d+)?$/;

function createMeasurement(system) {
  function parseString(str) {
    const result = str.match(POSSIBLE_VALUE_AND_OPTIONAL_ALIAS_RE);

    const [, value, alias] = result || [];

    if (!result || !STRICT_VALUE_RE.test(value)) {
      throw Error(
        `Tried to parse "${str}" but it doesn't appear to be a valid number`
      );
    }

    return [value.replace(/,/g, ''), alias];
  }

  function parse(str, unit = undefined) {
    const [value, alias] = parseString(str);

    return [Number(value), unit || system.getUnitForAlias(alias)];
  }

  function createAliasLookupObject(value) {
    return new Proxy(Object.create(null), {
      get(target, alias) {
        const unit = system.getUnitForAlias(alias);
        return m(value, unit);
      },
    });
  }

  function m(value, unit) {
    if (Array.isArray(value)) {
      return m(...parse(value[0], unit));
    }

    if (!(unit instanceof Unit)) {
      return createAliasLookupObject(value);
    }

    return new Measurement(value, unit);
  }

  return m;
}

module.exports = createMeasurement;
