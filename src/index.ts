import Measurement from './Measurement';
import ConverterCatalog from './ConverterCatalog';
import Unit from './Unit';
import parseConversions from './parseConversions';

function createUnitSystem(
  ...args: Parameters<typeof parseConversions>
): (value: number, unit: Unit) => Measurement {
  const conversions = parseConversions(...args);
  const catalog = new ConverterCatalog(conversions);
  return (value: number, unit: Unit) => new Measurement(value, unit, catalog);
}

export { createUnitSystem, Unit };
