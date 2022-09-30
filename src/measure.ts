import Measurement from './Measurement';
import Unit from './Unit';
import Converters from './Converters';

const CONVERTERS = Symbol('unit-system internals - do not use');

export type MeasureFunction = {
  (value: number, unit: Unit): Measurement;
  [CONVERTERS]: Converters;
};

export const isMeasureFunction = (value: unknown): value is MeasureFunction =>
  typeof value === 'function' && value.hasOwnProperty(CONVERTERS);

export default function createMeasure(converters: Converters): MeasureFunction {
  const measure = (value: number, unit: Unit) =>
    new Measurement(value, unit, converters);

  return Object.defineProperty(measure as MeasureFunction, CONVERTERS, {
    value: converters,
  });
}

export const getConvertersFromMeasure = (measure: MeasureFunction) =>
  measure[CONVERTERS];
