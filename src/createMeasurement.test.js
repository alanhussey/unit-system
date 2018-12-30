const Unit = require('./Unit');
const Measurement = require('./Measurement');
const UnitSystem = require('./UnitSystem');
const { divideBy } = require('./conversion');
const createMeasurement = require('./createMeasurement');

describe(createMeasurement, () => {
  let system;
  let m;
  const inch = new Unit('inch');

  beforeEach(() => {
    system = new UnitSystem();
    m = createMeasurement(system);
  });

  it('creates a Measurement', () => {
    expect(m(12, inch)).toEqual(new Measurement(12, inch));
  });

  it('can look up a unit by its alias', () => {
    system.register(inch, { alias: 'inches' });
    expect(m(12).inches).toEqual(new Measurement(12, inch));
  });

  it('can be called as a tagged template', () => {
    system.register(inch, { alias: 'inches' });
    expect(m`12 inches`).toEqual(new Measurement(12, inch));
  });

  it('can be called as a tagged template with an alias property', () => {
    system.register(inch, { alias: 'inches' });
    expect(m`12`.inches).toEqual(new Measurement(12, inch));
  });

  it('can be called as a tagged template with an inline unit', () => {
    expect(m`12 ${inch}`).toEqual(new Measurement(12, inch));
  });

  it('can convert a measurement to a different unit using an alias', () => {
    system.register(inch, { alias: 'inches' });
    const foot = new Unit('foot');
    system.register(foot, {
      alias: 'feet',
      convert: { from: [inch, divideBy(12)] },
    });
    expect(m`48 inches`.in.feet).toEqual(new Measurement(4, foot));
  });

  it('can convert a measurement by passing in the desired unit', () => {
    system.register(inch, { alias: 'inches' });
    const foot = new Unit('foot');
    system.register(foot, {
      convert: { from: [inch, divideBy(12)] },
    });
    expect(m`60 inches`.as(foot)).toEqual(new Measurement(5, foot));
  });

  it('can repeatedly implicitly convert', () => {
    system.register(inch, { alias: 'inches' });
    const foot = new Unit('foot');
    system.register(foot, {
      alias: 'feet',
      convert: { from: [inch, divideBy(12)] },
    });
    expect(m`60 inches`.as(foot).in.inches.in.feet).toEqual(
      new Measurement(5, foot)
    );
  });
});
