import Measurement from './Measurement';
import Unit from './Unit';
import Converters from './Converters';

const CONVERTERS = Symbol('unit-system internals - do not use');

export type MeasureFn = {
  (value: number, unit: Unit): Measurement;
  [CONVERTERS]: Converters;
};

export const isMeasureFn = (value: unknown): value is MeasureFn =>
  typeof value === 'function' && value.hasOwnProperty(CONVERTERS);

export default function createMeasure(converters: Converters): MeasureFn {
  const measure = (value: number, unit: Unit) =>
    new Measurement(value, unit, converters);

  return Object.defineProperty(measure as MeasureFn, CONVERTERS, {
    value: converters,
  });
}

export const getConvertersFromMeasure = (measure: MeasureFn) =>
  measure[CONVERTERS];
