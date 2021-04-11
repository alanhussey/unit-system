import DefaultMap from './DefaultMap';

describe(DefaultMap, () => {
  it('falls back to a default value when a key is missing', () => {
    const map = new DefaultMap<string, number>(() => 0);
    expect(map.get('a')).toBe(0);
  });

  it('prefers stored values', () => {
    const map = new DefaultMap<string, number>(() => 0);
    map.set('a', 1);
    expect(map.get('a')).toBe(1);
  });
});
