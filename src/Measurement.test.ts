import Converters from './Converters';
import Unit from './Unit';
import Measurement from './Measurement';
import Convert from './Convert';

const getMeasure = () => {
  const inches = new Unit('inch');
  const feet = new Unit('foot');
  const celsius = new Unit('celsius');
  const converters = new Converters([[feet, Convert.linear(12), inches]]);
  const measure = (value: number, unit: Unit) =>
    new Measurement(value, unit, converters);

  return [measure, { inches, feet, celsius }] as [
    (value: number, unit: Unit) => Measurement,
    { [k: string]: Unit },
  ];
};

describe(Measurement, () => {
  it('stores the given value and unit', () => {
    const [measure, { inches }] = getMeasure();
    const measurement = measure(12, inches);
    expect(measurement.value).toBe(12);
    expect(measurement.unit).toBe(inches);
  });

  describe(Measurement.prototype.in, () => {
    it('converts to the requested unit', () => {
      const [measure, { inches, feet }] = getMeasure();
      const measurement = measure(12, inches);
      expect(measurement.in(feet)).toEqual(measure(1, feet));
    });

    it('throws if it cannot convert to the requested unit', () => {
      const [measure, { feet, celsius }] = getMeasure();
      expect(() => {
        measure(1, feet).in(celsius);
      }).toThrowError(
        new TypeError('Cannot convert given measurement to requested unit'),
      );
    });
  });

  describe(Measurement.prototype.add, () => {
    it('adds two measurements together', () => {
      const [measure, { inches }] = getMeasure();
      expect(measure(12, inches).add(measure(4, inches))).toEqual(
        measure(16, inches),
      );
    });
  });

  describe(Measurement.prototype.subtract, () => {
    it('subtracts two measurements from each other', () => {
      const [measure, { inches }] = getMeasure();
      expect(measure(12, inches).subtract(measure(4, inches))).toEqual(
        measure(8, inches),
      );
    });
  });

  describe(Measurement.prototype.multiply, () => {
    it('multiplies by the given number', () => {
      const [measure, { inches }] = getMeasure();
      expect(measure(5, inches).multiply(3)).toEqual(measure(15, inches));
    });
  });

  describe(Measurement.prototype.divide, () => {
    it('divides by the given number', () => {
      const [measure, { inches }] = getMeasure();
      expect(measure(15, inches).divide(3)).toEqual(measure(5, inches));
    });
  });
});
