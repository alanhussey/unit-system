const createConverter = require('./createConverter');

describe(createConverter, () => {
  it('returns a converter object', () => {
    const forward = () => {};
    const backward = () => {};
    const converter = createConverter(forward, backward);

    expect(converter).toEqual({
      forward,
      backward,
    });
  });
});
