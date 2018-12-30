class Converter {
  constructor() {
    this.forward = this.forward.bind(this);
    this.backward = this.backward.bind(this);
  }
  forward() {
    throw new Error(
      `\`forward\` has not been implemented in ${this.constructor.name}`
    );
  }
  backward() {
    throw new Error(
      `\`backward\` has not been implemented in ${this.constructor.name}`
    );
  }
}

module.exports = Converter;
