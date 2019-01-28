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

  it('can be called as a tagged template (negative value)', () => {
    system.register(inch, { alias: 'inches' });
    expect(m`-12 inches`).toEqual(new Measurement(-12, inch));
  });

  it('can be called as a tagged template (no space)', () => {
    system.register(inch, { alias: 'in' });
    expect(m`12in`).toEqual(new Measurement(12, inch));
  });

  it('can be called as a tagged template (commas and decimal)', () => {
    system.register(inch, { alias: 'inches' });
    expect(m`1,234.567 inches`).toEqual(new Measurement(1234.567, inch));
  });

  it('can be called as a tagged template (everything)', () => {
    system.register(inch, { alias: 'in' });
    expect(m`-1,234,567.890in`).toEqual(new Measurement(-1234567.89, inch));
  });

  it.each([
    '1',
    '12',
    '123',
    '-123.4',
    '123.45',
    '1,234',
    '12,345',
    '123,456',
    '1,234,567',
    '1,234.567',
    '12,345.67',
    '1,234,567,890',
    '.1',
  ])('can parse "%s', str => {
    system.register(inch, { alias: 'in' });
    expect(m([`${str}in`])).toEqual(
      new Measurement(Number(str.replace(/,/g, '')), inch)
    );
  });

  it.each([
    '1,2',
    ',123',
    '123.',
    '12,34',
    '1234,567',
    '123,456,7',
    '1234.567,890',
    '1,234,567890',
    undefined,
    null,
    {},
    '',
  ])('throws an error when attempting to parse "%s"', str => {
    system.register(inch, { alias: 'in' });
    expect(() => m([`${str}in`])).toThrowError(
      new Error(
        `Tried to parse "${str}in" but it doesn't appear to be a valid number`
      )
    );
  });

  it('can be called as a tagged template with an alias property', () => {
    system.register(inch, { alias: 'inches' });
    expect(m`12`.inches).toEqual(new Measurement(12, inch));
  });

  it('throws an error if called as a tagged template with an alias property but alias does not exist', () => {
    system.register(inch, { alias: 'inches' });
    expect(() => m`12`.anchovies).toThrowError(
      new Error('Could not find a unit for the alias "anchovies"')
    );
  });

  it('can be called as a tagged template with an inline unit', () => {
    expect(m`12 ${inch}`).toEqual(new Measurement(12, inch));
  });
});
