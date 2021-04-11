// `DefaultMap` is to `Map` as python's `defaultdict` is to `dict`
export default class DefaultMap<TKey, TValue> extends Map<TKey, TValue> {
  private getDefault: () => TValue;
  constructor(getDefault: () => TValue) {
    super();
    this.getDefault = getDefault;
  }
  get(key: TKey): TValue {
    if (!this.has(key)) {
      this.set(key, this.getDefault());
    }
    return super.get(key) as TValue;
  }
}
