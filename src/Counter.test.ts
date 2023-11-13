import Counter from './Counter';

describe(Counter, () => {
  it('counts the number of occurrences of the given elements', () => {
    const counter = new Counter<string>(['a', 'b', 'c', 'a', 'a', 'b']);
    expect(Object.fromEntries(counter)).toEqual({
      a: 3,
      b: 2,
      c: 1,
    });
  });

  it('defaults to 0 for elements that were not seen', () => {
    const counter = new Counter(['a', 'b', 'a']);
    expect(counter.get('c')).toBe(0);
  });

  describe(Counter.prototype.add, () => {
    it('increments the count for given value by 1', () => {
      const counter = new Counter();
      counter.add('a');
      expect(counter.get('a')).toBe(1);
      counter.add('a');
      expect(counter.get('a')).toBe(2);
    });

    it('allows incrementing by other values', () => {
      const counter = new Counter();
      counter.add('a', 2);
      expect(counter.get('a')).toBe(2);
      counter.add('a', 3);
      expect(counter.get('a')).toBe(5);
    });
  });

  describe(Counter.prototype.subtract, () => {
    it('decrements the count for given value by 1', () => {
      const counter = new Counter(['a', 'a', 'a']);
      counter.subtract('a');
      expect(counter.get('a')).toBe(2);
      counter.subtract('a');
      expect(counter.get('a')).toBe(1);
    });

    it('allows decrementing by other values', () => {
      const counter = new Counter(['a', 'a', 'a', 'a', 'a']);
      counter.subtract('a', 2);
      expect(counter.get('a')).toBe(3);
      counter.subtract('a', 3);
      expect(counter.get('a')).toBe(0);
    });
  });

  describe(Counter.prototype.elements, () => {
    it('turns a counter into a generator of its values, each value appearing `count` times', () => {
      const counter = new Counter(['a', 'b', 'c', 'a', 'a', 'b']);
      expect(Object.prototype.toString.call(counter.elements())).toBe(
        '[object Generator]',
      );
      expect(Array.from(counter.elements())).toEqual([
        'a',
        'a',
        'a',
        'b',
        'b',
        'c',
      ]);
    });
  });
});
