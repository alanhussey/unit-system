import { MeasureFunction } from './measure';
import Converters from './Converters';
import Unit, { createUnit } from './Unit';
import Measurement from './Measurement';
import Convert from './Convert';

describe(Measurement, () => {
  const inches = createUnit('inch');
  const feet = createUnit('foot');
  const miles = createUnit('mile');
  const centimeters = createUnit('centimeter');
  const meters = createUnit('meter');
  const kilometers = createUnit('kilometer');

  const grams = createUnit('gram');
  const kilograms = createUnit('kilogram');

  const celsius = createUnit('celsius');
  const fahrenheit = createUnit('fahrenheit');

  const seconds = createUnit('second');
  const minutes = createUnit('minute');
  const hours = createUnit('hour');

  const converters = new Converters([
    [feet, Convert.linear(12), inches],
    [miles, Convert.linear(5280), feet],
    [inches, Convert.linear(2.54), centimeters],
    [kilometers, Convert.linear(1000), meters],
    [meters, Convert.linear(100), centimeters],
    [kilograms, Convert.linear(1000), grams],
    [celsius, Convert.linear(9 / 5, 32), fahrenheit],
    [hours, Convert.linear(60), minutes],
    [minutes, Convert.linear(60), seconds],
  ]);
  const measure = ((
    value: number,
    numerator: [Unit, ...Unit[]],
    denominator?: Unit[],
  ) =>
    new Measurement(
      value,
      numerator,
      denominator,
      converters,
    )) as MeasureFunction;

  it('stores the given value and units', () => {
    const measurement = measure(12, inches);
    expect(measurement.value).toBe(12);
    expect(measurement.unit).toEqual([[inches], []]);
  });

  describe(Measurement.prototype.in, () => {
    it('throws if no units are requested', () => {
      const measurement = measure(12, inches);
      expect(() => measurement.in([], [])).toThrowError(
        'Need at least one unit',
      );
    });

    it('throws if the desired units is not the same number as the starting units', () => {
      const measurement = measure(12, inches);
      expect(() => measurement.in([feet, feet], [])).toThrowError(
        'Unexpected mismatch in the number of units',
      );
    });

    it('converts to the requested unit', () => {
      const measurement = measure(12, inches);
      expect(measurement.in(feet)).toEqual(measure(1, feet));
    });

    it('throws if it cannot convert to the requested unit', () => {
      const measurement = measure(1, feet);
      expect(() => {
        measurement.in(celsius);
      }).toThrowError(
        new TypeError('Cannot convert given measurement to requested unit'),
      );
    });

    it('throws if it cannot find a converter for the requested unit', () => {
      const measurement = measure(1, feet);
      expect(() => {
        measurement.in(celsius);
      }).toThrowError(
        new TypeError('Cannot convert given measurement to requested unit'),
      );
    });

    it('can convert with compound units', () => {
      // 4 square feet
      const measurement = measure(2 * 2, [feet, feet]);
      expect(measurement.in([inches, inches])).toEqual(
        measure(24 * 24, [inches, inches]),
      );
    });

    it('can handle mixed units', () => {
      // 1 cubic foot
      const measurement = measure(12 * 1 * 1, [inches, feet, feet]);
      expect(measurement.in([feet, feet, feet])).toEqual(
        measure(1 * 1 * 1, [feet, feet, feet]),
      );
    });

    it('can handle mixed units 2', () => {
      // 8 cubic feet
      const measurement = measure(8 * 1 * 1, [feet, feet, feet]);
      expect(measurement.in([inches, inches, inches])).toEqual(
        measure(24 * 24 * 24, [inches, inches, inches]),
      );
    });

    it('can handle numerator and denominator units', () => {
      // 60mph
      const measurement = measure(60, [miles], [hours]);
      expect(measurement.in([meters], [seconds])).toEqual(
        measure(26.8224, [meters], [seconds]),
      );
    });

    it('can handle multiple units when the order is mismatched', () => {
      // 6 gram-meters
      const measurement = measure(2 * 3, [grams, meters]);
      expect(measurement.in([centimeters, kilograms])).toEqual(
        measure((2 / 1000) * 300, [centimeters, kilograms]),
      );
    });

    it('throws if the units are swapped', () => {
      const measurement = measure(2 * 3, [grams], [meters]);
      expect(() =>
        measurement.in([centimeters], [kilograms]),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Cannot convert given measurement to requested unit"`,
      );
    });
  });

  describe(Measurement.prototype.add, () => {
    it('adds two measurements together', () => {
      expect(measure(12, inches).add(measure(4, inches))).toEqual(
        measure(16, inches),
      );
    });
  });

  describe(Measurement.prototype.subtract, () => {
    it('subtracts two measurements from each other', () => {
      expect(measure(12, inches).subtract(measure(4, inches))).toEqual(
        measure(8, inches),
      );
    });
  });

  describe(Measurement.prototype.multiply, () => {
    it('multiplies by the given number', () => {
      expect(measure(5, inches).multiply(3)).toEqual(measure(15, inches));
    });
    it('multiplies by the given Measurement', () => {
      expect(measure(5, inches).multiply(measure(3, inches))).toEqual(
        measure(15, [inches, inches]),
      );
    });
    it('simplifies compound units when multiplying', () => {
      const measurement1 = measure(60, [miles], [hours]);
      const measurement2 = measure(3, [hours]);
      expect(measurement1.multiply(measurement2)).toEqual(
        measure(60 * 3, [miles]),
      );
    });
    it('turns x/y * y into x', () => {
      const measurement1 = measure(60, [miles], [hours]);
      const measurement2 = measure(3, [hours]);
      expect(measurement1.multiply(measurement2)).toEqual(
        measure(60 * 3, [miles]),
      );
    });
    it('turns x^2/y * y into x^2', () => {
      const measurement1 = measure(60, [miles, miles], [hours]);
      const measurement2 = measure(3, [hours]);
      expect(measurement1.multiply(measurement2)).toEqual(
        measure(60 * 3, [miles, miles]),
      );
    });
    it('turns xy/z * z/ab into xy/ab', () => {
      const measurement1 = measure(60, [miles, feet], [hours]);
      const measurement2 = measure(3, [hours], [kilograms, celsius]);
      expect(measurement1.multiply(measurement2)).toEqual(
        measure(60 * 3, [miles, feet], [kilograms, celsius]),
      );
    });
    it('turns x/yz * yz/a into x/a', () => {
      const measurement1 = measure(60, [miles], [feet, hours]);
      const measurement2 = measure(3, [feet, hours], [kilograms]);
      expect(measurement1.multiply(measurement2)).toEqual(
        measure(60 * 3, [miles], [kilograms]),
      );
    });
    it('throws when x/y * y/x', () => {
      const measurement1 = measure(60, [miles], [hours]);
      const measurement2 = measure(3, [hours], [miles]);
      expect(() => measurement1.multiply(measurement2)).toThrow(
        new TypeError(
          'This operation would produce a measurement with no units, ' +
            'which is not supported',
        ),
      );
    });
  });

  describe(Measurement.prototype.divide, () => {
    it('divides by the given number', () => {
      expect(measure(15, inches).divide(3)).toEqual(measure(5, inches));
    });
    it('simplifies compound units when dividing', () => {
      const measurement1 = measure(60, [miles], [hours]);
      const measurement2 = measure(3, [hours]);
      expect(measurement1.divide(measurement2)).toEqual(
        measure(60 / 3, [miles]),
      );
    });
    it('turns x*y / y into x', () => {
      const measurement1 = measure(60, [miles], [hours]);
      const measurement2 = measure(3, [hours]);
      expect(measurement1.divide(measurement2)).toEqual(
        measure(60 / 3, [miles]),
      );
    });
    it('turns x^2*y / y into x^2', () => {
      const measurement1 = measure(60, [miles, miles], [hours]);
      const measurement2 = measure(3, [hours]);
      expect(measurement1.divide(measurement2)).toEqual(
        measure(60 / 3, [miles, miles]),
      );
    });
    it('turns xyz / zab into xy/ab', () => {
      const measurement1 = measure(60, [miles, feet, hours]);
      const measurement2 = measure(3, [hours, kilograms, celsius]);
      expect(measurement1.divide(measurement2)).toEqual(
        measure(60 / 3, [miles, feet], [kilograms, celsius]),
      );
    });
    it('turns x/yz / a/yz into x/a', () => {
      const measurement1 = measure(60, [miles], [feet, hours]);
      const measurement2 = measure(3, [kilograms], [feet, hours]);
      expect(measurement1.divide(measurement2)).toEqual(
        measure(60 / 3, [miles], [kilograms]),
      );
    });
    it('throws when xy / yx', () => {
      expect(() => measure(15, inches).divide(measure(3, inches))).toThrowError(
        new TypeError(
          'This operation would produce a measurement with no units, ' +
            'which is not supported',
        ),
      );
    });
  });
});
