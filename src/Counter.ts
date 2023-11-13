import DefaultMap from './DefaultMap';

export default class Counter<T> extends DefaultMap<T, number> {
  constructor(iterable: Iterable<T> = []) {
    super(() => 0);
    for (const item of iterable) {
      this.add(item);
    }
  }

  add(item: T, delta = 1) {
    return this.set(item, this.get(item) + delta);
  }
  subtract(item: T, delta = 1) {
    return this.set(item, this.get(item) - delta);
  }

  *elements(): Generator<T> {
    for (let [item, count] of this) {
      while (count--) {
        yield item;
      }
    }
  }
}
