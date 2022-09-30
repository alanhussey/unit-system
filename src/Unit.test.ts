import * as fc from 'fast-check';
import Unit, { createUnit } from './Unit';

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
