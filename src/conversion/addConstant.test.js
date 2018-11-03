const { add, constant, addConstant } = require('./addConstant');

describe(addConstant, () => {
  it.each([[1, -272.15], [373.15, 100], [273.15, 0]])(
    'creates a converter that can convert Kelvin <=> Celsius',
    (kelvin, celsius) => {
      const { forward, backward } = addConstant(-273.15);
      expect(forward(kelvin)).toBe(celsius);
      expect(backward(celsius)).toBe(kelvin);
    }
  );

  it('has aliases', () => {
    expect(add).toBe(addConstant);
    expect(constant).toBe(addConstant);
  });
});
