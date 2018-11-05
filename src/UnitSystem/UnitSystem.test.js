const { divideBy } = require('../conversion');
const Measurement = require('../Measurement');
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

  describe('#convert', () => {
    const inch = new Unit('inch');
    const foot = new Unit('foot');
    const yard = new Unit('yard');

    let system;

    beforeEach(() => {
      system = new UnitSystem();
    });

    it('returns the same value if the destination unit is unchanged', () => {
      system.register(inch);

      const oneInch = new Measurement(1, inch);

      expect(system.convert(oneInch, inch)).toBe(oneInch);
    });

    it('can convert from one unit to another', () => {
      system.register(inch);
      system.register(foot, { convert: { from: [inch, divideBy(12)] } });

      const twelveInches = new Measurement(12, inch);
      const oneFoot = system.convert(twelveInches, foot);

      expect(oneFoot).toEqual(new Measurement(1, foot));
    });

    it('can convert from one unit to another through multiple steps', () => {
      system.register(inch);
      system.register(foot, { convert: { from: [inch, divideBy(12)] } });
      system.register(yard, { convert: { from: [foot, divideBy(3)] } });

      const thirtySixInches = new Measurement(36, inch);
      const oneYard = system.convert(thirtySixInches, yard);

      expect(oneYard).toEqual(new Measurement(1, yard));
    });

    it('can convert from one unit to another in reverse', () => {
      system.register(inch);
      system.register(foot, { convert: { from: [inch, divideBy(12)] } });
      system.register(yard, { convert: { from: [foot, divideBy(3)] } });

      const oneYard = new Measurement(1, yard);

      expect(system.convert(oneYard, inch)).toEqual(new Measurement(36, inch));
    });

    it('can define conversions to and from units', () => {
      system.register(inch);
      system.register(foot, {
        convert: {
          from: [inch, divideBy(12)],
          to: [yard, divideBy(3)],
        },
      });

      const oneYard = new Measurement(1, yard);

      expect(system.convert(oneYard, inch)).toEqual(new Measurement(36, inch));
    });

    it('throws an error if a suitable converter cannot be found', () => {
      const watt = new Unit('watt');
      system.register(inch);
      system.register(watt);

      const oneWatt = new Measurement(1, watt);
      expect(() => system.convert(oneWatt, inch)).toThrowError(
        new TypeError('Unable to find a converter from watt to inch')
      );
    });
  });
});
