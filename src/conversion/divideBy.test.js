const { divideBy } = require('./divideBy');

describe(divideBy, () => {
  it.each([[12, 1], [24, 2], [0, 0]])(
    'creates a converter that can convert inches <=> feet',
    (inches, feet) => {
      const { forward, backward } = divideBy(12);
      expect(forward(inches)).toBe(feet);
      expect(backward(feet)).toBe(inches);
    }
  );
});
