import Measurement from './Measurement';
import Unit from './Unit';
import Converters from './Converters';
import { toUnitArray } from './Unit';

const CONVERTERS = Symbol('unit-system internals - do not use');

export type MeasureFunction = {
  (value: number, unit: Unit): Measurement;
  (
    value: number,
    numerator: Unit | null, // support units like 'hertz'
    denominator: Unit | Unit[],
  ): Measurement;
  (
    value: number,
    numeratorUnits: Unit[],
    denominatorUnits?: Unit[],
  ): Measurement;
  [CONVERTERS]: Converters;
};

export const isMeasureFunction = (value: unknown): value is MeasureFunction =>
  typeof value === 'function' && value.hasOwnProperty(CONVERTERS);

export default function createMeasure(converters: Converters): MeasureFunction {
  const measure = (
    value: number,
    numerator?: Unit | Unit[],
    denominator?: Unit | Unit[],
  ) =>
    new Measurement(
      value,
      numerator ? toUnitArray(numerator) : [],
      denominator ? toUnitArray(denominator) : undefined,
      converters,
    );

  return Object.defineProperty(measure, CONVERTERS, {
    value: converters,
  }) as MeasureFunction;
}

export const getConvertersFromMeasure = (measure: MeasureFunction) =>
  measure[CONVERTERS];
