import Convert from './Convert';
import ConverterCatalog from './ConverterCatalog';
import Unit from './Unit';

describe(ConverterCatalog, () => {
  it('throws if duplicate conversions are declared', () => {
    const feet = new Unit('foot');
    const inches = new Unit('inch');
    expect(() => {
      new ConverterCatalog([
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
    const feet = new Unit('foot');
    expect(() => {
      new ConverterCatalog([[feet, Convert.linear(999), feet]]);
    }).toThrowError(
      new TypeError('Cannot declare a conversion between a unit and itself'),
    );
  });

  describe(ConverterCatalog.prototype.getConverter, () => {
    it('returns null when there are no converters', () => {
      const feet = new Unit('foot');
      const inches = new Unit('inch');
      const catalog = new ConverterCatalog([]);
      expect(catalog.getConverter(feet, inches)).toBe(null);
    });

    it('returns null when a converter cannot be found between the given units', () => {
      const feet = new Unit('foot');
      const inches = new Unit('inch');
      const yards = new Unit('yard');
      const catalog = new ConverterCatalog([[yards, Convert.linear(3), feet]]);
      expect(catalog.getConverter(feet, inches)).toBe(null);
    });

    it('returns the identity converter when the given units are the same', () => {
      const feet = new Unit('foot');
      const catalog = new ConverterCatalog([]);
      expect(catalog.getConverter(feet, feet)).toEqual(Convert.linear(1));
    });

    it('returns the declared converter when the two units are from an explicitly-declared converter', () => {
      const feet = new Unit('foot');
      const yards = new Unit('yard');
      const yardsToFeet = Convert.linear(3);
      const catalog = new ConverterCatalog([[yards, yardsToFeet, feet]]);
      expect(catalog.getConverter(yards, feet)).toBe(yardsToFeet);
    });

    it('returns the inverse converter when converting in reverse', () => {
      const feet = new Unit('foot');
      const yards = new Unit('yard');
      const yardsToFeet = Convert.linear(3);
      const catalog = new ConverterCatalog([[yards, yardsToFeet, feet]]);
      expect(catalog.getConverter(feet, yards)).toEqual(yardsToFeet.inverse);
    });

    it('returns a simplified converter when more than one declared converter is needed', () => {
      const yards = new Unit('yard');
      const feet = new Unit('foot');
      const inches = new Unit('inch');
      const catalog = new ConverterCatalog([
        [yards, Convert.linear(3), feet],
        [feet, Convert.linear(12), inches],
      ]);
      expect(catalog.getConverter(yards, inches)).toEqual(
        Convert.linear(3 * 12),
      );
    });

    it('returns a simplified converter when more than one declared converter is needed (multiple)', () => {
      const yards = new Unit('yard');
      const feet = new Unit('foot');
      const inches = new Unit('inch');
      const centimeters = new Unit('centimeter');
      const meters = new Unit('meter');
      const catalog = new ConverterCatalog([
        [yards, Convert.linear(3), feet],
        [feet, Convert.linear(12), inches],
        [inches, Convert.linear(2.54), centimeters],
        [centimeters, Convert.linear(1 / 100), meters],
      ]);
      expect(catalog.getConverter(yards, meters)).toEqual(
        Convert.linear((3 * 12 * 2.54) / 100),
      );
    });

    it('returns a simplified and reversed converter when more than one declared converter is needed', () => {
      const yards = new Unit('yard');
      const feet = new Unit('foot');
      const inches = new Unit('inch');
      const centimeters = new Unit('centimeter');
      const meters = new Unit('meter');
      const catalog = new ConverterCatalog([
        [yards, Convert.linear(3), feet],
        [feet, Convert.linear(12), inches],
        [inches, Convert.linear(2.54), centimeters],
        [centimeters, Convert.linear(1 / 100), meters],
      ]);
      expect(catalog.getConverter(meters, yards)).toEqual(
        // floating-point errors will be the bane of this project
        // Convert.linear((3 * 12 * 2.54) / 100).inverse
        Convert.linear(100 * (1 / 2.54) * (1 / 12) * (1 / 3)),
      );
    });

    it('caches a converter that has been simplified (and returns the same instance)', () => {
      const yards = new Unit('yard');
      const feet = new Unit('foot');
      const inches = new Unit('inch');
      const centimeters = new Unit('centimeter');
      const meters = new Unit('meter');
      const catalog = new ConverterCatalog([
        [yards, Convert.linear(3), feet],
        [feet, Convert.linear(12), inches],
        [inches, Convert.linear(2.54), centimeters],
        [centimeters, Convert.linear(1 / 100), meters],
      ]);
      expect(catalog.getConverter(meters, yards)).toBe(
        catalog.getConverter(meters, yards),
      );
    });
  });
});
