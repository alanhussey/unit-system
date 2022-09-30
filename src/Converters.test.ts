import Convert, { LinearConverter } from './Convert';
import Converters from './Converters';
import Unit, { createUnit } from './Unit';

describe(Converters, () => {
  it('throws if duplicate conversions are declared', () => {
    const feet = createUnit('foot');
    const inches = createUnit('inch');
    expect(() => {
      new Converters([
        [feet, Convert.linear(12), inches],
        [inches, Convert.linear(1 / 12), feet],
      ]);
    }).toThrowError(
      new TypeError(
        'Cannot declare two conversions for the same pair of units. ' +
          'Are you trying to declare the reverse of an existing conversion?',
      ),
    );
  });

  it('throws if a conversion is declared between a unit and itself', () => {
    const feet = createUnit('foot');
    expect(() => {
      new Converters([[feet, Convert.linear(999), feet]]);
    }).toThrowError(
      new TypeError('Cannot declare a conversion between a unit and itself'),
    );
  });

  describe('[Symbol.iterator]', () => {
    it('implements the iterable protocol', () => {
      const yards = createUnit('yard');
      const feet = createUnit('foot');
      const inches = createUnit('inch');
      const converters = new Converters([
        [feet, Convert.linear(12), inches],
        [yards, Convert.linear(3), feet],
      ]);

      expect(() => [...converters]).not.toThrow();
    });

    it('yields a sequence of edges', () => {
      const yards = createUnit('yard');
      const feet = createUnit('foot');
      const inches = createUnit('inch');
      const converters = new Converters([
        [feet, Convert.linear(12), inches],
        [yards, Convert.linear(3), feet],
      ]);

      for (const edge of converters) {
        expect(edge).toEqual([
          expect.any(Unit),
          expect.any(LinearConverter),
          expect.any(Unit),
        ]);
      }
    });

    it('can be used to clone a Converters', () => {
      const yards = createUnit('yard');
      const feet = createUnit('foot');
      const inches = createUnit('inch');
      const convertersA = new Converters([
        [feet, Convert.linear(12), inches],
        [yards, Convert.linear(3), feet],
      ]);

      const convertersB = new Converters(convertersA);

      expect(convertersA.get(inches, yards)).toEqual(
        convertersB.get(inches, yards),
      );
    });
  });

  describe(Converters.prototype.get, () => {
    it('returns null when there are no converters', () => {
      const feet = createUnit('foot');
      const inches = createUnit('inch');
      const converters = new Converters([]);
      expect(converters.get(feet, inches)).toBe(null);
    });

    it('returns null when a converter cannot be found between the given units', () => {
      const feet = createUnit('foot');
      const inches = createUnit('inch');
      const yards = createUnit('yard');
      const converters = new Converters([[yards, Convert.linear(3), feet]]);
      expect(converters.get(feet, inches)).toBe(null);
    });

    it('returns the identity converter when the given units are the same', () => {
      const feet = createUnit('foot');
      const converters = new Converters([]);
      expect(converters.get(feet, feet)).toEqual(Convert.linear(1));
    });

    it('returns the declared converter when the two units are from an explicitly-declared converter', () => {
      const feet = createUnit('foot');
      const yards = createUnit('yard');
      const yardsToFeet = Convert.linear(3);
      const converters = new Converters([[yards, yardsToFeet, feet]]);
      expect(converters.get(yards, feet)).toBe(yardsToFeet);
    });

    it('returns the inverse converter when converting in reverse', () => {
      const feet = createUnit('foot');
      const yards = createUnit('yard');
      const yardsToFeet = Convert.linear(3);
      const converters = new Converters([[yards, yardsToFeet, feet]]);
      expect(converters.get(feet, yards)).toEqual(yardsToFeet.inverse);
    });

    it('returns a simplified converter when more than one declared converter is needed', () => {
      const yards = createUnit('yard');
      const feet = createUnit('foot');
      const inches = createUnit('inch');
      const converters = new Converters([
        [yards, Convert.linear(3), feet],
        [feet, Convert.linear(12), inches],
      ]);
      expect(converters.get(yards, inches)).toEqual(Convert.linear(3 * 12));
    });

    it('returns a simplified converter when more than one declared converter is needed (multiple)', () => {
      const yards = createUnit('yard');
      const feet = createUnit('foot');
      const inches = createUnit('inch');
      const centimeters = createUnit('centimeter');
      const meters = createUnit('meter');
      const converters = new Converters([
        [yards, Convert.linear(3), feet],
        [feet, Convert.linear(12), inches],
        [inches, Convert.linear(2.54), centimeters],
        [centimeters, Convert.linear(1 / 100), meters],
      ]);
      expect(converters.get(yards, meters)).toEqual(
        Convert.linear((3 * 12 * 2.54) / 100),
      );
    });

    it('returns a simplified and reversed converter when more than one declared converter is needed', () => {
      const yards = createUnit('yard');
      const feet = createUnit('foot');
      const inches = createUnit('inch');
      const centimeters = createUnit('centimeter');
      const meters = createUnit('meter');
      const converters = new Converters([
        [yards, Convert.linear(3), feet],
        [feet, Convert.linear(12), inches],
        [inches, Convert.linear(2.54), centimeters],
        [centimeters, Convert.linear(1 / 100), meters],
      ]);
      expect(converters.get(meters, yards)).toEqual(
        // floating-point errors will be the bane of this project
        // Convert.linear((3 * 12 * 2.54) / 100).inverse
        Convert.linear(100 * (1 / 2.54) * (1 / 12) * (1 / 3)),
      );
    });

    it('caches a converter that has been simplified (and returns the same instance)', () => {
      const yards = createUnit('yard');
      const feet = createUnit('foot');
      const inches = createUnit('inch');
      const centimeters = createUnit('centimeter');
      const meters = createUnit('meter');
      const converters = new Converters([
        [yards, Convert.linear(3), feet],
        [feet, Convert.linear(12), inches],
        [inches, Convert.linear(2.54), centimeters],
        [centimeters, Convert.linear(1 / 100), meters],
      ]);
      expect(converters.get(meters, yards)).toBe(converters.get(meters, yards));
    });
  });
});
