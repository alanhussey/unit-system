import ConverterCatalog from './ConverterCatalog';
import Unit from './Unit';

export default class Measurement {
  readonly value: number;
  readonly unit: Unit;
  private catalog: ConverterCatalog;

  constructor(value: number, unit: Unit, catalog: ConverterCatalog) {
    this.value = value;
    this.unit = unit;
    this.catalog = catalog;
  }

  private measure(value: number, unit: Unit) {
    return new Measurement(value, unit, this.catalog);
  }

  in(unit: Unit): Measurement {
    const converter = this.catalog.getConverter(this.unit, unit);
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
