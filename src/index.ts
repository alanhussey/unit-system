import Measurement from './Measurement';
import ConverterCatalog from './ConverterCatalog';
import Unit from './Unit';
import parseConversions from './parseConversions';

type MeasureFn = (value: number, unit: Unit) => Measurement;

const createMeasure = (catalog: ConverterCatalog): MeasureFn =>
  function measure(value: number, unit: Unit) {
    return new Measurement(value, unit, catalog);
  };

function createUnitSystem(
  ...args: Parameters<typeof parseConversions>
): MeasureFn {
  const conversions = parseConversions(...args);
  const catalog = new ConverterCatalog(conversions);
  const measure = createMeasure(catalog);
  Object.assign(measure, { catalog });
  return measure;
}

export { createUnitSystem, Unit };
