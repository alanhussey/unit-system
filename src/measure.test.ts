import Converters from './Converters';
import createMeasure, { CONVERTERS, isMeasureFn } from './measure';
import Measurement from './Measurement';
import Unit from './Unit';

describe(createMeasure, () => {
  describe('returns a function that', () => {
    it('creates Measurements', () => {
      const converters = new Converters([]);
      const measure = createMeasure(converters);
      const feet = new Unit('foot');
      expect(measure(1, feet)).toEqual(new Measurement(1, feet, converters));
    });

    it('has a property with the Converters', () => {
      const converters = new Converters([]);
      const measure = createMeasure(converters);
      expect(measure[CONVERTERS]).toEqual(converters);
    });
  });
});

describe(isMeasureFn, () => {
  it('returns false if the value is not a function', () => {
    const measure = {};
    expect(isMeasureFn(measure)).toBe(false);
  });

  it('returns false if the value does not have a CONVERTERS property', () => {
    const measure = () => {};
    expect(isMeasureFn(measure)).toBe(false);
  });

  it('returns true if the value is a MeasureFn', () => {
    const measure = createMeasure(new Converters([]));
    expect(isMeasureFn(measure)).toBe(true);
  });
});
