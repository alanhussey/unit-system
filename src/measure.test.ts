import Converters from './Converters';
import createMeasure, {
  getConvertersFromMeasure,
  isMeasureFn,
} from './measure';
import Measurement from './Measurement';
import { createUnit } from './Unit';

describe(createMeasure, () => {
  describe('returns a function that', () => {
    it('creates Measurements', () => {
      const converters = new Converters([]);
      const measure = createMeasure(converters);
      const feet = createUnit('foot');
      expect(measure(1, feet)).toEqual(new Measurement(1, feet, converters));
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

describe(getConvertersFromMeasure, () => {
  it('returns the Converters for a MeasureFn', () => {
    const converters = new Converters([]);
    const measure = createMeasure(converters);
    expect(getConvertersFromMeasure(measure)).toBe(converters);
  });
});
