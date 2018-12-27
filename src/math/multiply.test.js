const Measurement = require('../Measurement');
const Unit = require('../Unit');
const multiply = require('./multiply');

describe(multiply, () => {
  it('throws if a Measurement is not supplied', () => {
    expect(() => multiply(2, 3)).toThrowError(
      new TypeError('Expected a Measurement but got none')
    );
  });

  it('throws if more than one Measurement is supplied', () => {
    const foot = new Unit('foot');
    expect(() =>
      multiply(new Measurement(2, foot), new Measurement(3, foot))
    ).toThrowError(new TypeError('Cannot multiply more than one Measurement'));
  });

  it('throws if just a single value is provided', () => {
    const foot = new Unit('foot');
    expect(() => multiply(new Measurement(2, foot))).toThrowError(
      new TypeError('Cannot multiply a Measurement with nothing')
    );
  });

  it('multiplies a Measurement and a number', () => {
    const foot = new Unit('foot');
    expect(multiply(new Measurement(2, foot), 3)).toEqual(
      new Measurement(6, foot)
    );
    expect(multiply(5, new Measurement(4, foot))).toEqual(
      new Measurement(20, foot)
    );
  });

  it('multiplies a Measurement and multiple numbers', () => {
    const foot = new Unit('foot');
    const values = [4, 5, new Measurement(2, foot), 3];
    expect(multiply(...values)).toEqual(new Measurement(120, foot));
  });
});
