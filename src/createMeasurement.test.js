const Unit = require('./Unit');
const Measurement = require('./Measurement');
const UnitSystem = require('./UnitSystem');
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
});
