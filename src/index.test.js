const index = require('./index');

test('has the expected exports', () => {
  expect(index).toEqual({
    Unit: require('./Unit'),
    Measurement: require('./Measurement'),
    UnitSystem: require('./UnitSystem'),
    conversion: require('./conversion'),
    createUnitSystem: require('./createUnitSystem'),
  });
});

describe('createUnitSystem', () => {
  const { createUnitSystem, conversion } = index;
  test('creates a functional unit system', () => {
    const { createUnit, m, convert } = createUnitSystem();

    const kilometer = createUnit('kilometer', {
      alias: 'km',
    });
    const meter = createUnit('meter', {
      convert: {
        from: [kilometer, conversion.multiplyBy(1000)],
      },
    });
    const centimeter = createUnit('centimeter', {
      convert: {
        from: [meter, conversion.multiplyBy(100)],
      },
    });

    const inch = createUnit('inch', {
      convert: {
        to: [centimeter, conversion.multiplyBy(2.54)],
      },
    });
    const foot = createUnit('foot', {
      convert: {
        from: [inch, conversion.divideBy(12)],
      },
    });
    const mile = createUnit('mile', {
      alias: 'mile',
      convert: {
        to: [foot, conversion.multiplyBy(5280)],
      },
    });

    expect(convert(m(1, mile), kilometer)).toEqual(m`1.609344 km`);
  });
});
