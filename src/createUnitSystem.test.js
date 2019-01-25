const { multiplyBy, divideBy } = require('./conversion');
const UnitSystem = require('./UnitSystem');
const createUnitSystem = require('./createUnitSystem');

describe(createUnitSystem, () => {
  it('returns an object', () => {
    expect(createUnitSystem()).toEqual({
      system: jasmine.any(UnitSystem),
      createUnit: jasmine.any(Function),
      m: jasmine.any(Function),
      convert: jasmine.any(Function),
      add: jasmine.any(Function),
      subtract: jasmine.any(Function),
      multiply: jasmine.any(Function),
      divide: jasmine.any(Function),
      equal: jasmine.any(Function),
      lessThan: jasmine.any(Function),
      lessThanOrEqual: jasmine.any(Function),
      greaterThan: jasmine.any(Function),
      greaterThanOrEqual: jasmine.any(Function),
    });
  });

  it('creates a functional unit system', () => {
    const { createUnit, m, convert } = createUnitSystem();

    const kilometer = createUnit('kilometer', {
      alias: 'km',
    });
    const meter = createUnit('meter', {
      convert: {
        from: [kilometer, multiplyBy(1000)],
      },
    });
    const centimeter = createUnit('centimeter', {
      convert: {
        from: [meter, multiplyBy(100)],
      },
    });

    const inch = createUnit('inch', {
      convert: {
        to: [centimeter, multiplyBy(2.54)],
      },
    });
    const foot = createUnit('foot', {
      convert: {
        from: [inch, divideBy(12)],
      },
    });
    const mile = createUnit('mile', {
      alias: 'mile',
      convert: {
        to: [foot, multiplyBy(5280)],
      },
    });

    expect(convert(m`1 mile`, kilometer)).toEqual(m`1.609344 km`);
  });
});
