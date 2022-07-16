import Converters from './Converters';
import Unit from './Unit';

export default class Measurement {
  readonly value: number;
  readonly unit: Unit;
  private converters: Converters;

  constructor(value: number, unit: Unit, converters: Converters) {
    this.value = value;
    this.unit = unit;
    this.converters = converters;
  }

  private measure(value: number, unit: Unit) {
    return new Measurement(value, unit, this.converters);
  }

  in(unit: Unit): Measurement {
    const converter = this.converters.get(this.unit, unit);
    if (!converter) {
      throw new TypeError('Cannot convert given measurement to requested unit');
    }
    const value = converter.convert(this.value);
    return this.measure(value, unit);
  }

  add(b: Measurement): Measurement {
    const value = this.value + b.in(this.unit).value;
    return this.measure(value, this.unit);
  }
  subtract(b: Measurement): Measurement {
    const value = this.value - b.in(this.unit).value;
    return this.measure(value, this.unit);
  }

  multiply(b: number): Measurement {
    const value = this.value * b;
    return this.measure(value, this.unit);
  }
  divide(b: number): Measurement {
    const value = this.value / b;
    return this.measure(value, this.unit);
  }
}
