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

  it('can clone an existing unit system', () => {
    const inches = new Unit('inch');
    const feet = new Unit('foot');
    const miles = new Unit('mile');
    const oldMeasure = createUnitSystem`
      ${miles} * 5280 -> ${feet}
      ${feet} * 12 -> ${inches}
    `;

    const measure = createUnitSystem`
      ${oldMeasure}
    `;

    expect(measure(1, miles).in(inches)).toEqual(measure(5280 * 12, inches));
  });

  it('can stitch together multiple unit systems', () => {
    const ms = new Unit('meter');
    const cms = new Unit('centimeter');
    const kms = new Unit('kilometer');
    const measureSI = createUnitSystem`
      ${ms} * 100 -> ${cms}
      ${ms} / 1000 -> ${kms}
    `;

    const inches = new Unit('inch');
    const feet = new Unit('foot');
    const miles = new Unit('mile');
    const measureUS = createUnitSystem`
      ${miles} * 5280 -> ${feet}
      ${feet} * 12 -> ${inches}
    `;

    const measure = createUnitSystem`
      ${measureSI}
      ${measureUS}
      ${inches} * 2.54 -> ${cms}
    `;

    expect(measure(1, miles).in(kms)).toEqual(measure(1.609344, kms));
  });
});
