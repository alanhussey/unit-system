import createMeasure, { getConvertersFromMeasure, MeasureFunction, isMeasureFunction } from './measure';
import Converters from './Converters';
import Unit from './Unit';
import parseConversions from './parseConversions';

function* chain<T>(...iterables: Iterable<T>[]): Generator<T> {
  for (const iterable of iterables) {
    for (const value of iterable) {
      yield value;
    }
  }
}

function getAllConversions(
  fragments: Parameters<typeof parseConversions>[0],
  ...args: (Unit | MeasureFunction)[]
) {
  const conversions = parseConversions(fragments, ...args);
  const measures = args.filter(isMeasureFunction);
  const convertersFromMeasures = measures.map(getConvertersFromMeasure);
  return chain(conversions, ...convertersFromMeasures);
}

export function createUnitSystem(
  ...args: Parameters<typeof getAllConversions>
): MeasureFunction {
  const conversions = getAllConversions(...args);
  const converters = new Converters(conversions);
  const measure = createMeasure(converters);
  return measure;
}
