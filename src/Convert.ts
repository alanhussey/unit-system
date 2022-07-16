const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

export interface Converter {
  convert(value: number): number;
}

export class LinearConverter implements Converter {
  readonly a: number;
  readonly b: number;

  constructor(a: number, b = 0) {
    if (a === 0 || !Number.isFinite(a)) {
      throw new Error(
        `A linear conversion with an \`a\` of ${a} is not invertible`,
      );
    }
    this.a = a;
    this.b = b;
  }

  convert(value: number): number {
    return this.a * value + this.b;
  }

  get inverse(): LinearConverter {
    const { a, b } = this;
    return new LinearConverter(1 / a, -b / a);
  }

  // given an array of LinearConverters, precalculate the effective constants of the whole conversion
  static fromLinearConverters(converters: LinearConverter[]): LinearConverter {
    // TODO long-hand explanation of how this works
    // TODO can this be simplified to a single loop?
    const terms = converters.reduce(
      (terms, { a, b }) => [b, ...terms.map((term) => a * term)],
      [IDENTITY.b, IDENTITY.a],
    );
    const a = terms.pop() as number;
    const b = sum(terms);
    return new LinearConverter(a, b);
  }
}

// in anticipation of exponential/logarithmic converters
class CompoundConverter implements Converter {
  readonly converters: ReadonlyArray<Converter>;
  constructor(converters: Converter[]) {
    this.converters = Object.freeze(converters);
  }
  convert(value: number): number {
    let result = value;
    for (const converter of this.converters) {
      result = converter.convert(result);
    }
    return result;
  }
}

const isLinearConverter = (converter: unknown): converter is LinearConverter =>
  converter instanceof LinearConverter;

export function simplifyConverters(converters: Converter[]): Converter {
  if (converters.length === 1) {
    return converters[0];
  }
  if (converters.every(isLinearConverter)) {
    return LinearConverter.fromLinearConverters(converters);
  }
  return new CompoundConverter(converters);
}

export const IDENTITY = new LinearConverter(1);

export default {
  linear(
    ...args: ConstructorParameters<typeof LinearConverter>
  ): LinearConverter {
    return new LinearConverter(...args);
  },
};
