const Unit = require('./Unit');

describe('Unit', () => {
  it('exists', () => {
    expect(() => new Unit()).not.toThrow();
  });

  it('stores its name', () => {
    const inch = new Unit('inch');

    expect(inch.name).toBe('inch');
  });
});
