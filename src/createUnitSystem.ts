import Measurement from './Measurement';
import Converters from './Converters';
import Unit from './Unit';
import parseConversions from './parseConversions';

const __SECRET_INTERNALS_DO_NOT_USE = Symbol('secret unit-system internals');

type MeasureFn = {
  (value: number, unit: Unit): Measurement;
  [__SECRET_INTERNALS_DO_NOT_USE]: Converters;
};

export const createMeasure = (converters: Converters): MeasureFn =>
  Object.assign(
    function measure(value: number, unit: Unit) {
      return new Measurement(value, unit, converters);
    },
    { [__SECRET_INTERNALS_DO_NOT_USE]: converters },
  );

const isMeasureFn = (arg: unknown): arg is MeasureFn =>
  typeof arg === 'function' &&
  arg.hasOwnProperty(__SECRET_INTERNALS_DO_NOT_USE);

function* chain<T>(...generators: Generator<T>[]): Generator<T> {
  for (const generator of generators) {
    yield* generator;
  }
}

function getAllConversions(
  fragments: Parameters<typeof parseConversions>[0],
  ...args: (Unit | MeasureFn)[]
) {
  const conversions = parseConversions(fragments, ...args);
  const measures = args.filter(isMeasureFn);
  return chain(
    conversions,
    ...measures.map((measure) =>
      measure[__SECRET_INTERNALS_DO_NOT_USE][Symbol.iterator](),
    ),
  );
}

export function createUnitSystem(
  ...args: Parameters<typeof getAllConversions>
): MeasureFn {
  const allConversions = getAllConversions(...args);
  const converters = new Converters(allConversions);
  const measure = createMeasure(converters);
  return measure;
}
