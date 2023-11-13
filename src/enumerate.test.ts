import enumerate from './enumerate';

describe(enumerate, () => {
  it('returns a generator that yields [index, element] tuples', () => {
    const enumerated = enumerate(['a', 'b', 'c']);
    expect(Object.prototype.toString.call(enumerated)).toBe(
      '[object Generator]',
    );
    expect(Array.from(enumerated)).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ]);
  });

  it('also works for generators', () => {
    const generator = (function* () {
      yield 'a';
      yield 'b';
      yield 'c';
    })();
    const enumerated = enumerate(generator);
    expect(Array.from(enumerated)).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ]);
  });
});
