const index = require('./index');

test('has the expected exports', () => {
  expect(index.Unit).not.toBe(undefined);
  expect(index.UnitSystem).not.toBe(undefined);
});
