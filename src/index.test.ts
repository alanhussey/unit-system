import Measurement from './Measurement';
import { createUnitSystem, Unit } from './index';

describe(createUnitSystem, () => {
  it('returns a function for creating measurements', () => {
    const inches = new Unit('inch');
    const measure = createUnitSystem``;
    const measurement = measure(12, inches);
    expect(measurement).toBeInstanceOf(Measurement);
    expect(measurement.value).toBe(12);
    expect(measurement.unit).toBe(inches);
  });

  it('example usage', () => {
    const yards = new Unit('yard');
    const feet = new Unit('foot');
    const inches = new Unit('inch');
    const centimeters = new Unit('centimeter');
    const meters = new Unit('meter');

    const measure = createUnitSystem`
      ${yards} * 3 -> ${feet}
      ${feet} * 12 -> ${inches}
      ${inches} * 2.54 -> ${centimeters}
      ${centimeters} / 100 -> ${meters}
    `;

    const measurement = measure(18, inches)
      .add(measure(2, feet))
      .subtract(measure(1, yards))
      .multiply(3)
      .in(centimeters);

    expect(measurement).toEqual(measure(45.72, centimeters));
  });
});
