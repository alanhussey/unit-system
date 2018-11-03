const Unit = require('./Unit');
const Measurement = require('./Measurement');

describe(Measurement, () => {
  const inch = new Unit('inch');

  it('stores a value', () => {
    const measurement = new Measurement(12, inch);
    expect(measurement.value).toBe(12);
  });

  it('requires a value', () => {
    expect(() => {
      new Measurement();
    }).toThrowError(
      new TypeError(
        'new Measurement(value, unit) requires a value, got (undefined, undefined) instead'
      )
    );
  });

  it('stores a unit', () => {
    const measurement = new Measurement(12, inch);
    expect(measurement.unit).toBe(inch);
  });

  it('requires a unit', () => {
    expect(() => {
      new Measurement(12, 'not a unit');
    }).toThrowError(
      new TypeError(
        'new Measurement(value, unit) requires a unit, got (12, "not a unit") instead'
      )
    );
  });

  it('is immutable (value)', () => {
    const oneInch = new Measurement(1, inch);

    oneInch.value = 2;
    expect(oneInch.value).toBe(1);
  });

  it('is immutable (unit)', () => {
    const oneInch = new Measurement(1, inch);

    const foot = new Unit('foot');
    oneInch.unit = foot;

    expect(oneInch.unit).toBe(inch);
  });
});
