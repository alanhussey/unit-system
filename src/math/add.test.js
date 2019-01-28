const Measurement = require('../Measurement');
const Unit = require('../Unit');
const add = require('./add');

describe(add, () => {
  it('throws if no values are provided', () => {
    expect(() => {
      add();
    }).toThrowError(
      new TypeError('Expected at least 2 Measurements but got none')
    );
  });

  it('returns the measurement if only one was provided', () => {
    const inch = new Unit('inch');
    const oneInch = new Measurement(1, inch);
    expect(add(oneInch)).toBe(oneInch);
  });

  it('throws if not all measurements have the same unit', () => {
    const inch = new Unit('inch');
    const foot = new Unit('foot');
    const measurements = [
      new Measurement(1, inch),
      new Measurement(1, inch),
      new Measurement(1, foot),
    ];
    expect(() => add(...measurements)).toThrowError(
      new TypeError('Cannot add measurements with different units: inch, foot')
    );
  });

  it('adds the values', () => {
    const inch = new Unit('inch');
    expect(
      add(
        new Measurement(1, inch),
        new Measurement(2, inch),
        new Measurement(3, inch),
        new Measurement(4, inch),
        new Measurement(5, inch)
      )
    ).toEqual(new Measurement(15, inch));
  });
});
