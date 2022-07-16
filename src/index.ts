import Measurement from './Measurement';
import Converters from './Converters';
import Unit from './Unit';
import parseConversions from './parseConversions';

type MeasureFn = (value: number, unit: Unit) => Measurement;

const createMeasure = (converters: Converters): MeasureFn =>
  function measure(value: number, unit: Unit) {
    return new Measurement(value, unit, converters);
  };

function createUnitSystem(
  ...args: Parameters<typeof parseConversions>
): MeasureFn {
  const conversions = parseConversions(...args);
  const converters = new Converters(conversions);
  const measure = createMeasure(converters);
  return measure;
}

export { createUnitSystem, Unit };
