import * as fc from 'fast-check';
import Unit, { CompoundUnit, createUnit, simplify, toUnitArray } from './Unit';

describe(createUnit, () => {
  it('creates a Unit', () => {
    fc.assert(
      fc.property(fc.string(), (name) => {
        const unit = createUnit(name);
        expect(unit).toBeInstanceOf(Unit);
        expect(unit.name).toBe(name);
      }),
    );
  });
});

describe(simplify, () => {
  it('simplifies compound units', () => {
    const miles = createUnit('mile');
    const hours = createUnit('hour');
    const milesPerHourTimesHours: CompoundUnit = [[miles, hours], [hours]];
    const result: CompoundUnit = [[miles], []];
    expect(simplify(milesPerHourTimesHours)).toEqual(result);
  });
});

describe(toUnitArray, () => {
  it('wraps a unit in an array of that unit', () => {
    const feet = createUnit('foot');
    expect(toUnitArray(feet)).toEqual([feet]);
  });

  it('leaves an array of units as an array', () => {
    const feet = createUnit('foot');
    const inches = createUnit('inch');
    expect(toUnitArray([feet, inches])).toEqual([feet, inches]);
  });
});
