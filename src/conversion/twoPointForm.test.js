const { twoPoint, fromExamples, byExample } = require('./twoPointForm');

describe(twoPoint, () => {
  it('throws if the two points create a vertical line', () => {
    expect(() => twoPoint([1, 1], [1, 2])).toThrowError(
      new Error('Cannot create an equation of a vertical line')
    );
  });

  it.each([[-40, -40], [0, 32], [100, 212]])(
    'creates a converter that can convert Celsius <=> Fahrenheit',
    (celsius, fahrenheit) => {
      const freezing = [0, 32];
      const boiling = [100, 212];
      const { forward, backward } = twoPoint(freezing, boiling);

      expect(forward(celsius)).toBe(fahrenheit);
      expect(backward(fahrenheit)).toBe(celsius);
    }
  );

  it('has aliases', () => {
    expect(fromExamples).toBe(twoPoint);
    expect(byExample).toBe(twoPoint);
  });
});
