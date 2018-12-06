const Measurement = require('../Measurement');
const Unit = require('../Unit');
const subtract = require('./subtract');

describe(subtract, () => {
  it('throws if no values are provided', () => {
    expect(() => {
      subtract();
    }).toThrowError(new TypeError('Expected exactly 2 Measurements but got 0'));
  });

  it('throws if more than two measurements were provided', () => {
    const inch = new Unit('inch');
    expect(() => {
      subtract(
        new Measurement(1, inch),
        new Measurement(2, inch),
        new Measurement(3, inch)
      );
    }).toThrowError(new TypeError('Expected exactly 2 Measurements but got 3'));
  });

  it('returns the measurement if only one was provided', () => {
    const inch = new Unit('inch');
    const oneInch = new Measurement(1, inch);
    expect(subtract(oneInch)).toBe(oneInch);
  });

  it('throws if not all measurements have the same unit', () => {
    const inch = new Unit('inch');
    const foot = new Unit('foot');
    expect(() =>
      subtract(new Measurement(1, inch), new Measurement(1, foot))
    ).toThrowError(
      new TypeError('Cannot subtract measurements with different units')
    );
  });

  it('subtracts the two measurements', () => {
    const inch = new Unit('inch');
    expect(
      subtract(new Measurement(3, inch), new Measurement(1, inch))
    ).toEqual(new Measurement(2, inch));
  });
});
