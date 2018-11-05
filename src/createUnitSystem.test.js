const { multiplyBy } = require('./conversion');
const UnitSystem = require('./UnitSystem');
const createUnitSystem = require('./createUnitSystem');

describe(createUnitSystem, () => {
  it('returns an object', () => {
    expect(createUnitSystem()).toEqual({
      system: jasmine.any(UnitSystem),
      createUnit: jasmine.any(Function),
      m: jasmine.any(Function),
      convert: jasmine.any(Function),
    });
  });

  it('creates a functional unit system', () => {
    const { createUnit, m, convert } = createUnitSystem();
    const inch = createUnit('inch', { alias: 'inches' });
    const foot = createUnit('foot', {
      alias: 'feet',
      convert: { to: [inch, multiplyBy(12)] },
    });
    const yard = createUnit('yard', {
      alias: 'yards',
      convert: { to: [foot, multiplyBy(3)] },
    });

    expect(convert(m`2 yards`, foot)).toEqual(m`6`.feet);
    expect(convert(m`1 ${yard}`, inch)).toEqual(m`36`.inches);
  });
});
