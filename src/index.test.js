const index = require('./index');

test('has the expected exports', () => {
  expect(index).toEqual({
    Unit: require('./Unit'),
    Measurement: require('./Measurement'),
    UnitSystem: require('./UnitSystem'),
    conversion: require('./conversion'),
  });
});
