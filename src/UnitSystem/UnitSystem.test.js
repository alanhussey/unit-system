const { divideBy, multiplyBy } = require('../conversion');
const Measurement = require('../Measurement');
const Unit = require('../Unit');
const UnitSystem = require('./UnitSystem');

describe(UnitSystem, () => {
  it('can be defined with units', () => {
    const inch = new Unit('inch');
    const foot = new Unit('foot');
    const system = new UnitSystem([
      [inch, { alias: 'inches', convert: { to: [foot, divideBy(12)] } }],
      [foot, { alias: 'feet' }],
    ]);

    expect(system.getUnitForAlias('inches')).toBe(inch);
    expect(system.getUnitForAlias('feet')).toBe(foot);
    expect(system.convert(new Measurement(12, inch), foot)).toEqual(
      new Measurement(1, foot)
    );
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

  describe('#registerAll', () => {
    it('registers multiple units', () => {
      const system = new UnitSystem();
      system.registerAll([
        [new Unit('inch'), { alias: 'inches' }],
        [new Unit('foot'), { alias: 'feet' }],
        [new Unit('yard'), { alias: 'yards' }],
      ]);

      expect(system.getUnitForAlias('inches').name).toBe('inch');
      expect(system.getUnitForAlias('feet').name).toBe('foot');
      expect(system.getUnitForAlias('yards').name).toBe('yard');
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

    it('throws an error if a Measurement is not provided', () => {
      expect(() => {
        system.convert({ value: 12, unit: inch }, foot);
      }).toThrowError(
        new TypeError(
          'Expected a Measurement, got "{"value":12,"unit":{"name":"inch"}}" instead'
        )
      );
    });

    it('throws an error if a Unit is not provided', () => {
      expect(() => {
        system.convert(new Measurement(12, inch), { name: 'foot' });
      }).toThrowError(
        new TypeError('Expected a Unit, got "{"name":"inch"}" instead')
      );
    });
  });

  describe('#merge', () => {
    it('throws if a UnitSystem is not passed in', () => {
      const mySystem = new UnitSystem();

      expect(() => {
        mySystem.merge(null);
      }).toThrowError(
        new TypeError('Expected a UnitSystem but got "[null]" instead')
      );
    });

    it('adds the units from the other system to this system', () => {
      const imperial = new UnitSystem();
      imperial.register(new Unit('inch'), { alias: 'inches' });

      const metric = new UnitSystem();
      const centimeter = new Unit('centimeter');
      metric.register(centimeter, { alias: 'cm' });

      imperial.merge(metric);

      expect(imperial.getUnitForAlias('cm')).toBe(centimeter);
    });

    it('adds the units from the multiple system to this system', () => {
      const mySystem = new UnitSystem();
      mySystem.register(new Unit('inch'), { alias: 'inches' });

      const systemA = new UnitSystem();
      const foot = new Unit('foot');
      systemA.register(foot, { alias: 'feet' });
      const systemB = new UnitSystem();
      const yard = new Unit('yard');
      systemB.register(yard, { alias: 'yards' });
      const systemC = new UnitSystem();
      const mile = new Unit('mile');
      systemC.register(mile, { alias: 'miles' });

      mySystem.merge(systemA, systemB, systemC);

      expect(mySystem.getUnitForAlias('feet')).toBe(foot);
      expect(mySystem.getUnitForAlias('yards')).toBe(yard);
      expect(mySystem.getUnitForAlias('miles')).toBe(mile);
    });

    it('throws if there are conflicting aliases', () => {
      const imperial = new UnitSystem();
      imperial.register(new Unit('imperial inch'), { alias: 'inches' });

      const unitedStatesCustomary = new UnitSystem();
      unitedStatesCustomary.register(new Unit('US inch'), { alias: 'inches' });

      expect(() => {
        imperial.merge(unitedStatesCustomary);
      }).toThrowError();
    });

    it('throws if there are conflicting converters', () => {
      const imperial = new UnitSystem();
      const metric = new UnitSystem();
      const inch = new Unit('inch');
      const centimeter = new Unit('centimeter');

      metric.register(centimeter);
      metric.register(inch, {
        convert: { to: [centimeter, multiplyBy(2.54)] },
      });
      imperial.register(inch);
      imperial.register(centimeter, {
        convert: { to: [inch, divideBy(2.54)] },
      });

      expect(() => {
        imperial.merge(metric);
      }).toThrowError();
    });
  });

  describe('#addConverter', () => {
    it('throws if the given units have not been registered yet', () => {
      const inch = new Unit('inch');
      const foot = new Unit('foot');

      const system = new UnitSystem();

      expect(() => {
        system.addConverter(inch, foot, divideBy(12));
      }).toThrowError(
        new Error(
          'Cannot add a converter for a unit that has not been registered yet (inch is not registered)'
        )
      );
    });

    it('adds a converter for the given units', () => {
      const inch = new Unit('inch');
      const foot = new Unit('foot');
      const system = new UnitSystem([[inch], [foot]]);
      system.addConverter(inch, foot, divideBy(12));

      expect(system.convert(new Measurement(12, inch), foot)).toEqual(
        new Measurement(1, foot)
      );
    });
  });

  describe('#add', () => {
    it('adds', () => {
      const inch = new Unit('inch');
      const system = new UnitSystem([[inch]]);

      expect(
        system.add(
          new Measurement(1, inch),
          new Measurement(2, inch),
          new Measurement(3, inch)
        )
      ).toEqual(new Measurement(6, inch));
    });

    it('adds measurements in compatible units', () => {
      const inch = new Unit('inch');
      const foot = new Unit('foot');
      const system = new UnitSystem([
        [inch],
        [foot, { convert: { to: [inch, multiplyBy(12)] } }],
      ]);

      expect(
        system.add(
          new Measurement(1, foot),
          new Measurement(7, inch),
          new Measurement(5, inch)
        )
      ).toEqual(new Measurement(2, foot));
    });
  });

  describe('#subtract', () => {
    it('subtracts', () => {
      const inch = new Unit('inch');
      const system = new UnitSystem([[inch]]);

      expect(
        system.subtract(new Measurement(3, inch), new Measurement(1, inch))
      ).toEqual(new Measurement(2, inch));
    });

    it('subtracts measurements in compatible units', () => {
      const inch = new Unit('inch');
      const foot = new Unit('foot');
      const system = new UnitSystem([
        [inch],
        [foot, { convert: { to: [inch, multiplyBy(12)] } }],
      ]);

      expect(
        system.subtract(new Measurement(2, foot), new Measurement(12, inch))
      ).toEqual(new Measurement(1, foot));
    });
  });

  describe('#multiply', () => {
    it('multiplies', () => {
      const inch = new Unit('inch');
      const system = new UnitSystem([[inch]]);

      expect(system.multiply(new Measurement(3, inch), 2)).toEqual(
        new Measurement(6, inch)
      );
    });
  });

  describe('#divide', () => {
    it('divides', () => {
      const inch = new Unit('inch');
      const system = new UnitSystem([[inch]]);

      expect(system.divide(new Measurement(6, inch), 2)).toEqual(
        new Measurement(3, inch)
      );
    });

    it('divides measurements in compatible units', () => {
      const inch = new Unit('inch');
      const foot = new Unit('foot');
      const system = new UnitSystem([
        [inch],
        [foot, { convert: { to: [inch, multiplyBy(12)] } }],
      ]);

      expect(
        system.divide(new Measurement(2, foot), new Measurement(12, inch))
      ).toEqual(2);
    });
  });
});
