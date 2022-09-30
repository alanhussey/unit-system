import Converters from './Converters';
import createMeasure, {
  getConvertersFromMeasure,
  isMeasureFunction,
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

describe(isMeasureFunction, () => {
  it('returns false if the value is not a function', () => {
    const measure = {};
    expect(isMeasureFunction(measure)).toBe(false);
  });

  it('returns false if the value does not have a CONVERTERS property', () => {
    const measure = () => {};
    expect(isMeasureFunction(measure)).toBe(false);
  });

  it('returns true if the value is a MeasureFunction', () => {
    const measure = createMeasure(new Converters([]));
    expect(isMeasureFunction(measure)).toBe(true);
  });
});

describe(getConvertersFromMeasure, () => {
  it('returns the Converters for a MeasureFunction', () => {
    const converters = new Converters([]);
    const measure = createMeasure(converters);
    expect(getConvertersFromMeasure(measure)).toBe(converters);
  });
});
