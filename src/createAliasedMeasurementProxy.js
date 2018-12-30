// Returns a proxy object. Any alias in the given unit system
// is a valid property, and getting one of those properties
// will return the result of calling `getValueForUnit` with
// the corresponding unit for that alias.
//
// For example:
//   const obj = createAliasedMeasurementProxy(
//       system,
//       unit => `${unit.name.toUpperCase()}!!`
//   );
//   obj.ft // -> "FOOT!!", if "ft" was registered as an alias
//                          for `new Unit("foot")`
function createAliasedMeasurementProxy(system, getValueForUnit) {
  return new Proxy(Object.create(null), {
    get(target, alias) {
      const unit = system.getUnitForAlias(alias);
      return getValueForUnit(unit);
    },
  });
}
module.exports = createAliasedMeasurementProxy;
