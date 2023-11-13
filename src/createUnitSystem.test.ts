import Measurement from './Measurement';
import { createUnit } from './index';
import { createUnitSystem } from './createUnitSystem';

describe(createUnitSystem, () => {
  it('returns a function for creating measurements', () => {
    const inches = createUnit('inch');
    const measure = createUnitSystem``;
    const measurement = measure(12, inches);
    expect(measurement).toEqual(
      new Measurement(12, inches, undefined, expect.anything())
    );
  });

  it('can clone an existing unit system', () => {
    const inches = createUnit('inch');
    const feet = createUnit('foot');
    const miles = createUnit('mile');
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
    const ms = createUnit('meter');
    const cms = createUnit('centimeter');
    const kms = createUnit('kilometer');
    const measureSI = createUnitSystem`
      ${ms} * 100 -> ${cms}
      ${ms} / 1000 -> ${kms}
    `;

    const inches = createUnit('inch');
    const feet = createUnit('foot');
    const miles = createUnit('mile');
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
