import { createUnitSystem, createUnit } from './index';

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
