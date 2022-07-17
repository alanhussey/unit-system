import Measurement from './Measurement';
import { Unit } from './index';
import { createUnitSystem } from './createUnitSystem';

describe(createUnitSystem, () => {
  it('returns a function for creating measurements', () => {
    const inches = new Unit('inch');
    const measure = createUnitSystem``;
    const measurement = measure(12, inches);
    expect(measurement).toBeInstanceOf(Measurement);
    expect(measurement.value).toBe(12);
    expect(measurement.unit).toBe(inches);
  });
});
