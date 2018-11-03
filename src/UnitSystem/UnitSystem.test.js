const Unit = require('../Unit');
const UnitSystem = require('./UnitSystem');

describe(UnitSystem, () => {
  it('can be defined with units', () => {
    const inch = new Unit('inch');
    const foot = new Unit('foot');
    const system = new UnitSystem([
      [inch, { alias: 'inches' }],
      [foot, { alias: 'feet' }],
    ]);

    expect(system.getUnitForAlias('inches')).toBe(inch);
    expect(system.getUnitForAlias('feet')).toBe(foot);
  });

  describe('#register', () => {
    it('stores stores a unit by the given alias', () => {
      const system = new UnitSystem();
      const inch = new Unit('inch');

      system.register(inch, { alias: 'inches' });

      expect(system.getUnitForAlias('inches')).toBe(inch);
    });

    it('can define multiple aliases for a given unit', () => {
      const system = new UnitSystem();
      const inch = new Unit('inch');

      system.register(inch, { alias: ['inch', 'inches', 'in'] });

      expect(system.getUnitForAlias('inch')).toBe(inch);
      expect(system.getUnitForAlias('inches')).toBe(inch);
      expect(system.getUnitForAlias('in')).toBe(inch);
    });
  });
});
