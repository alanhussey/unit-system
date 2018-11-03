const Unit = require('./Unit');

describe(Unit, () => {
  it('stores its name', () => {
    const inch = new Unit('inch');

    expect(inch.name).toBe('inch');
  });
});
