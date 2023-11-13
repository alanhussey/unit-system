import Counter from './Counter';

// TODO: explain why not magic strings instead
export default class Unit {
  readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
}

export const createUnit = (name: string) => new Unit(name);

export type CompoundUnit = readonly [Unit[], Unit[]];

// Simplify the given compound unit it by 'canceling'
// matching units from the numerator and denominator.
// For example, a compound unit of…
//   [ A^2*B^3*C / A*B*C*D ]
// …can be reduced to:
//   [ A*B^2 / D ]
export function simplify([numerator, denominator]: CompoundUnit): CompoundUnit {
  if (numerator.length === 0 || denominator.length === 0)
    return [numerator, denominator];

  const countedNumerator = new Counter(numerator);
  const countedDenominator = new Counter(denominator);
  for (const unit of new Set([...numerator, ...denominator])) {
    // for each unit, 'cancel' as many matching pairs from the numerator and denominator as possible
    const diff = Math.min(
      countedNumerator.get(unit),
      countedDenominator.get(unit),
    );
    if (diff > 0) {
      countedNumerator.subtract(unit, diff);
      countedDenominator.subtract(unit, diff);
    }
  }
  const newNumerator = Array.from(countedNumerator.elements());
  const newDenominator = Array.from(countedDenominator.elements());
  if (newNumerator.length + newDenominator.length === 0) {
    throw new TypeError(
      'This operation would produce a measurement with no units, ' +
        'which is not supported',
    );
  }
  return [newNumerator, newDenominator];
}

// wrap a single Unit in an array, or keep an array of Units as-is
export function toUnitArray(units: Unit | Unit[]): Unit[] {
  return ([] as Unit[]).concat(units);
}
