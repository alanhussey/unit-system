// TODO: explain why not magic strings instead
export default class Unit {
  readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
}

export const createUnit = (name: string) => new Unit(name);
