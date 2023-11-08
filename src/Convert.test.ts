import * as fc from 'fast-check';
import Convert, { LinearConverter, simplifyConverters } from './Convert';

// all floats, excluding NaN and Infinity
const realFloat = () =>
  fc.float({ next: true, noDefaultInfinity: true, noNaN: true });

// all floats, excluding NaN, Infinity, zero, and numbers close to zero
// (small numbers cause problems with floats)
const realFloatNonZero = () =>
  realFloat().filter((n) => !(n <= 1e-5 && n >= -1e-5));

const linearConverterArgs = () => fc.tuple(realFloatNonZero(), realFloat());

const linearConverter = () =>
  linearConverterArgs().map((args) => new LinearConverter(...args));

const isInvalidCoefficientError = (err: unknown): err is Error =>
  err instanceof Error &&
  /^A linear conversion with an `a` of .+ is not invertible$/.test(err.message);

// Get a decimal representing the relative difference between two numbers.
//   > getRelativeDifference(1, 1) -> 0
//   > getRelativeDifference(5, 6) -> .2
//   > getRelativeDifference(6, 5) -> .2
//   > getRelativeDifference(5e100, 6e100) -> .2
const getRelativeDifference = (left: number, right: number) => {
  return Math.max(left / right, right / left) - 1;
};

const isVeryClose = (left: number, right: number, threshold = 1e-10) =>
  left === right || getRelativeDifference(left, right) < threshold;

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

  it.each([0, Infinity, -Infinity, NaN])(
    'disallows an `a` value of %s',
    (a) => {
      expect(() => new LinearConverter(a)).toThrowError(
        new Error(
          `A linear conversion with an \`a\` of ${a} is not invertible`,
        ),
      );
    },
  );

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
    it('reduces an array of linear converters to a single linear converter', () => {
      fc.assert(
        fc.property(
          fc.array(linearConverter()),
          realFloatNonZero(),
          (linearConverters, value) => {
            let linearConverter;
            try {
              linearConverter = LinearConverter.fromLinearConverters(
                linearConverters,
              );
            } catch (err) {
              if (isInvalidCoefficientError(err)) return true;
              throw err;
            }

            const actual = linearConverter.convert(value);
            const expected = linearConverters.reduce(
              (result, converter) => converter.convert(result),
              value,
            );
            // due to floating point imprecision, we get sufficient drift
            // between the implementations that we need to allow for
            // a very small difference between the results
            return isVeryClose(expected, actual);
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
      fc.property(fc.array(linearConverter()), (converters) => {
        try {
          return simplifyConverters(converters) instanceof LinearConverter;
        } catch (err) {
          if (isInvalidCoefficientError(err)) {
            // due to the nature of floats, it's possible for fast-check to give us
            // a sequence of linear conversions that reduce to an `a` factor of `0`.
            // We could try to .filter(...) that out, but we'd eventually just be
            // implementing `LinearConverter.fromLinearConverters` again in this test.
            return true;
          } else {
            throw err;
          }
        }
      }),
    );
  });

  it.todo('turns a mixed array of converters into a single CompoundConverter');
});
