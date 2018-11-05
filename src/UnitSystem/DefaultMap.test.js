const DefaultMap = require('./DefaultMap');

describe(DefaultMap, () => {
  it('has a default value when getting a key that has not been added yet', () => {
    const map = new DefaultMap(() => 'default value');
    expect(map.get('b')).toBe('default value');
  });

  it('works like a normal map', () => {
    const map = new DefaultMap(() => 'default');
    map.set('a', 1);
    expect(map.has('a')).toBe(true);
    expect(map.get('a')).toBe(1);
    expect(Array.from(map.entries())).toEqual([['a', 1]]);
  });
});
