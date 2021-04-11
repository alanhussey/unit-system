import * as fc from 'fast-check';
import Convert, { LinearConverter, simplifyConverters } from './Convert';

// all floats, excluding NaN and Infinity
const realFloat = () =>
  fc.float({ next: true, noDefaultInfinity: true, noNaN: true });

// all floats, excluding NaN, Infinity, zero, and numbers close to zero
// (small numbers cause problems with floats)
const realFloatNonZero = () =>
  fc
    .float({ next: true, noDefaultInfinity: true, noNaN: true })
    .filter((n: number) => !(n <= 1e-200 && n >= -1e-200));

const linearConverterArgs = () => fc.tuple(realFloatNonZero(), realFloat());

describe('Convert', () => {
  describe(Convert.linear, () => {
    it('returns a linear converter', () => {
      fc.assert(
        fc.property(linearConverterArgs(), ([a, b]) => {
          expect(Convert.linear(a, b)).toEqual(new LinearConverter(a, b));
        }),
      );
    });
  });
});

describe(LinearConverter, () => {
  it('expresses a linear equation', () => {
    fc.assert(
      fc.property(linearConverterArgs(), realFloat(), ([a, b], value) => {
        const converter = new LinearConverter(a, b);
        return a * value + b === converter.convert(value);
      }),
    );
  });

  it.each([0, Infinity, -Infinity, NaN])('disallows an `a` value of %s', a => {
    expect(() => new LinearConverter(a)).toThrowError(
      new Error(`A linear conversion with an \`a\` of ${a} is not invertible`),
    );
  });

  describe('#inverse', () => {
    it('is the inverse of the defined linear converter', () => {
      fc.assert(
        fc.property(linearConverterArgs(), realFloat(), ([a, b], value) => {
          const linearConverter = new LinearConverter(a, b);
          const invertedLinearConverter = new LinearConverter(1 / a, -b / a);
          return (
            linearConverter.inverse.convert(value) ===
            invertedLinearConverter.convert(value)
          );
        }),
      );
    });
  });

  describe(LinearConverter.fromLinearConverters, () => {
    it.skip('reduces an array of linear converters to a single linear converter', () => {
      fc.assert(
        fc.property(
          fc.array(linearConverterArgs()),
          realFloatNonZero(),
          (argsArray, value) => {
            const linearConverters = argsArray.map(
              args => new LinearConverter(...args),
            );
            const linearConverter = LinearConverter.fromLinearConverters(
              linearConverters,
            );
            // the derived converter produces the same result as running the array of converters in sequence
            return (
              linearConverter.convert(value) ===
              linearConverters.reduce(
                (result, converter) => converter.convert(result),
                value,
              )
            );
          },
        ),
      );
    });
  });
});

describe(simplifyConverters, () => {
  it('returns the only converter if there is only one', () => {
    const converter = new LinearConverter(1);
    expect(simplifyConverters([converter])).toBe(converter);
  });

  it('turns an array of LinearConverters into a single LinearConverter', () => {
    fc.assert(
      fc.property(fc.array(linearConverterArgs()), argsArray => {
        const converters = argsArray.map(args => new LinearConverter(...args));
        return simplifyConverters(converters) instanceof LinearConverter;
      }),
    );
  });

  it.todo('turns a mixed array of converters into a single CompoundConverter');
});
