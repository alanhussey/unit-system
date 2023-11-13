import ExtendableError from './ExtendableError';
import { Converter } from './Convert';
import Converters from './Converters';
import enumerate from './enumerate';
import Unit, {
  simplify as simplifyUnits,
  CompoundUnit,
  toUnitArray,
} from './Unit';

class UnitMismatchError extends ExtendableError {
  measurement: Measurement;
  unit: Unit | Unit[];
  constructor(
    message: string | undefined,
    measurement: Measurement,
    unit: Unit | Unit[],
  ) {
    super(message);
    this.measurement = measurement;
    this.unit = unit;
  }
}

export default class Measurement {
  readonly value: number;

  get unit(): CompoundUnit {
    return [this.#numerators, this.#denominators];
  }

  #numerators: Unit[];
  #denominators: Unit[];

  #converters: Converters;

  constructor(
    value: number,
    numerators: Unit | Unit[],
    denominators: Unit[] = [],
    converters: Converters,
  ) {
    this.value = value;
    this.#numerators = toUnitArray(numerators);
    this.#denominators = denominators;
    this.#converters = converters;
  }

  private measure(value: number, numerators: Unit[], denominators: Unit[]) {
    return new Measurement(value, numerators, denominators, this.#converters);
  }

  in(unit: Unit): Measurement;
  in(units: Unit[]): Measurement;
  in(numerators: Unit[], denominators: Unit[]): Measurement;
  in(numerators: Unit | Unit[], denominators: Unit[] = []) {
    numerators = toUnitArray(numerators);

    if (0 === numerators.length + denominators.length) {
      // TODO better error message
      throw new UnitMismatchError('Need at least one unit', this, []);
    }

    const convertNumerator = this.getCompoundConverter(this.#numerators, numerators);
    const convertDenominator = this.getCompoundConverter(
      this.#denominators,
      denominators,
    );
    const value = convertNumerator(this.value) / convertDenominator(1);

    return this.measure(value, numerators, denominators);
  }

  private getCompoundConverter(start: Unit[], end: Unit[]): (value: number) => number {
    const converters = this.getConverters(start, end);
    // using the distributive property, expand `value` to `value * 1**n`,
    // (where `n` is the number of converters), run each `1` through its
    // corresponding converter, and then multiply everything together
    return (value) =>
      converters.reduce(
        (value, converter) => value * converter.convert(1),
        value,
      );
  }

  private getConverters(start: Unit[], end: Unit[]) {
    if (start.length !== end.length) {
      // TODO better error message
      throw new UnitMismatchError(
        'Unexpected mismatch in the number of units',
        this,
        end,
      );
    }

    // keep track of which units we've already matched
    const endUnits = [...end];

    return start.map(
      (startUnit): Converter => {
        let converter: Converter | null = null;

        for (const [index, endUnit] of enumerate(endUnits)) {
          converter = this.#converters.get(startUnit, endUnit);
          if (converter) {
            // we've found a match for `endUnit`, so don't consider this unit again
            endUnits.splice(index, 1);
            break;
          }
        }

        if (!converter) {
          throw new UnitMismatchError(
            'Cannot convert given measurement to requested unit',
            this,
            end,
          );
        }
        return converter;
      },
    );
  }

  add(other: Measurement): Measurement {
    const value = this.value + other.in(...this.unit).value;
    return this.measure(value, ...this.unit);
  }
  subtract(other: Measurement): Measurement {
    const value = this.value - other.in(...this.unit).value;
    return this.measure(value, ...this.unit);
  }

  multiply(other: number): Measurement;
  multiply(other: Measurement): Measurement;
  multiply(other: number | Measurement): Measurement;
  multiply(other: number | Measurement): Measurement {
    if (other instanceof Measurement) {
      const value = this.value * other.value;
      const units = simplifyUnits([
        this.#numerators.concat(other.#numerators),
        this.#denominators.concat(other.#denominators),
      ]);
      return this.measure(value, ...units);
    } else {
      const value = this.value * other;
      return this.measure(value, ...this.unit);
    }
  }
  divide(other: number): Measurement;
  divide(other: Measurement): Measurement;
  divide(other: number | Measurement): Measurement;
  divide(other: number | Measurement): Measurement {
    // turn division into multiplication by inverting `other`
    const inverted =
      other instanceof Measurement
        ? this.measure(1 / other.value, other.#denominators, other.#numerators)
        : 1 / other;

    return this.multiply(inverted);
  }
}
