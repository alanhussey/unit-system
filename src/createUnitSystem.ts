import createMeasure, { CONVERTERS, MeasureFn, isMeasureFn } from './measure';
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
  ...args: (Unit | MeasureFn)[]
) {
  const conversions = parseConversions(fragments, ...args);
  const measures = args.filter(isMeasureFn);
  return chain(conversions, ...measures.map((measure) => measure[CONVERTERS]));
}

export function createUnitSystem(
  ...args: Parameters<typeof getAllConversions>
): MeasureFn {
  const conversions = getAllConversions(...args);
  const converters = new Converters(conversions);
  const measure = createMeasure(converters);
  return measure;
}
