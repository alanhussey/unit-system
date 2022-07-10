import fc from 'fast-check';

import tokenize, { ARROW } from './tokenize';

describe(tokenize, () => {
  test('tokenize stress test', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('*', '/'),
        fc.constantFrom(' ', ''),
        fc.nat().filter((x) => x > 0),
        fc.constantFrom(' ', ''),
        fc.constantFrom('+', '-'),
        fc.constantFrom(' ', ''),
        fc.integer(),
        fc.constantFrom(' ', ''),
        (md, _, a, __, pm, ___, b, ____) => {
          const declaration = [md, _, a, __, pm, ___, b, ____, ARROW].join('');
          expect(Array.from(tokenize(declaration))).toEqual(
            b < 0
              ? [md, String(a), pm, '-', String(-b), ARROW]
              : [md, String(a), pm, String(b), ARROW],
          );
        },
      ),
    );
  });
});
