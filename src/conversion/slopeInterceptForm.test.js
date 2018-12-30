const Converter = require('./Converter');
const { slopeIntercept, multiplyBy, times } = require('./slopeInterceptForm');

describe(slopeIntercept, () => {
  it('returns a converter', () => {
    expect(slopeIntercept()).toBeInstanceOf(Converter);
  });

  it.each([[1, 12], [2, 24], [0, 0]])(
    'creates a converter that can convert feet <=> inches',
    (feet, inches) => {
      const { forward, backward } = slopeIntercept(12);

      expect(forward(feet)).toBe(inches);
      expect(backward(inches)).toBe(feet);
    }
  );

  it.each([[0, 32], [100, 212], [-40, -40]])(
    'creates a converter that can convert Celsius <=> Fahrenheit',
    (celsius, fahrenheit) => {
      const { forward, backward } = slopeIntercept(9 / 5, 32);

      expect(forward(celsius)).toBe(fahrenheit);
      expect(backward(fahrenheit)).toBe(celsius);
    }
  );

  it('exports aliases', () => {
    expect(multiplyBy).toBe(slopeIntercept);
    expect(times).toBe(slopeIntercept);
  });
});
