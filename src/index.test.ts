import { createUnitSystem, createUnit } from './index';
import type { CompoundUnit } from './index';

test('example usage', () => {
  const yards = createUnit('yard');
  const feet = createUnit('foot');
  const inches = createUnit('inch');
  const centimeters = createUnit('centimeter');
  const meters = createUnit('meter');

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

test('example with compound units', () => {
  const miles = createUnit('mile');
  const feet = createUnit('foot');
  const inches = createUnit('inch');
  const centimeters = createUnit('centimeter');
  const meters = createUnit('meter');

  const hours = createUnit('hour');
  const minutes = createUnit('minute');
  const seconds = createUnit('second');

  const measure = createUnitSystem`
    ${miles} / 5280 -> ${feet}
    ${feet} * 12 -> ${inches}
    ${inches} * 2.54 -> ${centimeters}
    ${centimeters} / 100 -> ${meters}

    ${hours} / 60 -> ${minutes}
    ${minutes} / 60 -> ${seconds}
  `;

  const sixtyMilesPerHour = measure(60, miles).divide(measure(1, hours));
  const metersPerSecond: CompoundUnit = [[meters], [seconds]];
  expect(sixtyMilesPerHour.in(...metersPerSecond)).toEqual(
    measure((((60 / 5280) * 12 * 2.54) / 100) * 60 * 60, meters, seconds),
  );
});
