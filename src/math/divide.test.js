const Unit = require('../Unit');
const Measurement = require('../Measurement');
const divide = require('./divide');

describe(divide, () => {
  it('throws if a Measurement is not supplied', () => {
    expect(() => divide(2, 3)).toThrowError(
      new TypeError('Expected a Measurement but got none')
    );
  });

  it('throws if just a single value is provided', () => {
    const foot = new Unit('foot');
    expect(() => divide(new Measurement(2, foot))).toThrowError(
      new TypeError('Cannot divide a Measurement with nothing')
    );
  });

  it('divides a Measurement by a number', () => {
    const foot = new Unit('foot');
    expect(divide(new Measurement(6, foot), 3)).toEqual(
      new Measurement(2, foot)
    );
  });

  it('throws when dividing two Measurements with different unit', () => {
    const foot = new Unit('foot');
    const second = new Unit('second');
    expect(() =>
      divide(new Measurement(6, foot), new Measurement(2, second))
    ).toThrowError(
      new TypeError('Cannot divide two Measurements with different units')
    );
  });

  it('returns a number when dividing two Measurements with the same unit', () => {
    const foot = new Unit('foot');
    expect(divide(new Measurement(6, foot), new Measurement(2, foot))).toBe(3);
  });
});
