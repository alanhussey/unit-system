import Convert from './Convert';
import Unit from './Unit';
import parseConversions from './parseConversions';
import fc from 'fast-check';

describe(parseConversions, () => {
  it('returns conversion tuples representing the declared conversions', () => {
    const inches = new Unit('inch');
    const feet = new Unit('foot');
    const yards = new Unit('yard');
    expect(
      Array.from(
        parseConversions`
          ${feet} * 12 -> ${inches}
          ${yards} * 3 -> ${feet}
        `,
      ),
    ).toEqual([
      [feet, Convert.linear(12), inches],
      [yards, Convert.linear(3), feet],
    ]);
  });

  it('handles conversions with a `/ a`', () => {
    const inches = new Unit('inch');
    const feet = new Unit('foot');
    const yards = new Unit('yard');
    expect(
      Array.from(
        parseConversions`
          ${inches} / 12 -> ${feet}
          ${feet} / 3 -> ${yards}
        `,
      ),
    ).toEqual([
      [inches, Convert.linear(1 / 12), feet],
      [feet, Convert.linear(1 / 3), yards],
    ]);
  });

  it('handles conversions with a `+ b`', () => {
    const celsius = new Unit('Celsius');
    const fahrenheit = new Unit('Fahrenheit');
    expect(
      Array.from(
        parseConversions`
          ${celsius} * 1.8 + 32 -> ${fahrenheit}
        `,
      ),
    ).toEqual([[celsius, Convert.linear(1.8, 32), fahrenheit]]);
  });

  it('handles conversions with a `- b`', () => {
    const celsius = new Unit('Celsius');
    const fahrenheit = new Unit('Fahrenheit');
    expect(
      Array.from(
        parseConversions`
                          # lol floats
          ${fahrenheit} * 0.5555555555555556 - 32 -> ${celsius}
        `,
      ),
    ).toEqual([[fahrenheit, Convert.linear(5 / 9, -32), celsius]]);
  });

  it('handles conversions with an implicit `a=1`', () => {
    const celsius = new Unit('Celsius');
    const kelvin = new Unit('Kelvin');
    expect(
      Array.from(
        parseConversions`
          ${kelvin} - 273.15 -> ${celsius}
        `,
      ),
    ).toEqual([[kelvin, Convert.linear(1, -273.15), celsius]]);
  });

  it('ignores comment lines', () => {
    const celsius = new Unit('Celsius');
    const kelvin = new Unit('Kelvin');
    expect(
      Array.from(
        parseConversions`
          # this is how you convert from Kelvin to Celsius
          ${kelvin} - 273.15 -> ${celsius}
        `,
      ),
    ).toEqual([[kelvin, Convert.linear(1, -273.15), celsius]]);
  });

  it('ignores trailing comments', () => {
    const celsius = new Unit('Celsius');
    const kelvin = new Unit('Kelvin');
    expect(
      Array.from(
        parseConversions`
          ${kelvin} - 273.15 -> ${celsius} # this is how you convert from Kelvin to Celsius
        `,
      ),
    ).toEqual([[kelvin, Convert.linear(1, -273.15), celsius]]);
  });

  it('ignores blank lines', () => {
    const celsius = new Unit('Celsius');
    const kelvin = new Unit('Kelvin');
    expect(
      Array.from(
        parseConversions`

          ${kelvin} - 273.15 -> ${celsius}
        `,
      ),
    ).toEqual([[kelvin, Convert.linear(1, -273.15), celsius]]);
  });

  it('ignores lines with just whitespace', () => {
    const celsius = new Unit('Celsius');
    const kelvin = new Unit('Kelvin');
    expect(
      Array.from(
        parseConversions`
        
        ${kelvin} - 273.15 -> ${celsius}
              
        `,
      ),
    ).toEqual([[kelvin, Convert.linear(1, -273.15), celsius]]);
  });

  it('throws on unexpected lines', () => {
    expect(() =>
      Array.from(parseConversions`
    this could be a comment, but it doesn't start with #
  `),
    ).toThrowError(
      new SyntaxError(
        `Unexpected content (expected a declaration or a comment):
"\\n    this could be a comment, but it doesn't start with #\\n  "`,
      ),
    );
  });

  it('throws on unparseable lines', () => {
    expect(() =>
      Array.from(parseConversions`
    ${new Unit('left')} * 12 = ${new Unit('right')}
  `),
    ).toThrowError(
      new SyntaxError(
        `Unexpected content (expected a declaration or a comment):
" * 12 = "`,
      ),
    );
  });

  it.each([
    [
      `a`,
      '*',
      parseConversions`
        ${new Unit('left')} * -> ${new Unit('right')}
      `,
    ],

    [
      `a`,
      '/',
      parseConversions`
        ${new Unit('left')} / -> ${new Unit('right')}
      `,
    ],

    [
      `b`,
      '+',
      parseConversions`
        ${new Unit('left')} + -> ${new Unit('right')}
      `,
    ],

    [
      `b`,
      '-',
      parseConversions`
        ${new Unit('left')} - -> ${new Unit('right')}
      `,
    ],
  ])('throws when the %s is missing (%s)', (_, operator, parsed) => {
    expect(() => Array.from(parsed)).toThrowErrorMatchingInlineSnapshot(`
      "Conversion declaration is invalid:
      <unit> ${operator} -> <unit>
               ^^"
    `);
  });

  it.each([
    [
      '`a` coefficient',
      '*',
      parseConversions`
        ${new Unit('left')} * nonsense -> ${new Unit('right')}
      `,
    ],
    [
      '`a` coefficient',
      '/',
      parseConversions`
        ${new Unit('left')} / nonsense -> ${new Unit('right')}
      `,
    ],
    [
      '`b` term',
      '+',
      parseConversions`
        ${new Unit('left')} + nonsense -> ${new Unit('right')}
      `,
    ],
    [
      '`b` term',
      '-',
      parseConversions`
        ${new Unit('left')} - nonsense -> ${new Unit('right')}
      `,
    ],
  ])('throws when the %s is not a number (%s)', (_, op, parsed) => {
    expect(() => Array.from(parsed)).toThrowErrorMatchingInlineSnapshot(`
      "Conversion declaration is invalid:
      <unit> ${op} nonsense -> <unit>
               ^^^^^^^^"
    `);
  });

  it('throws if the declaration does not end after the arrow (->)', () => {
    expect(() =>
      Array.from(parseConversions`
        ${new Unit('left')} -> * 5 + 1 ${new Unit('right')}
      `),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Unexpected token(s) after end of conversion declaration:
      <unit> -> * 5 + 1 <unit>
               ^^^^^^^^"
    `);
  });

  test('parsing stress test', () => {
    fc.assert(
      fc.property(
        fc.string().map((name) => new Unit(name)),
        fc.string().map((name) => new Unit(name)),
        fc.constantFrom('*', '/'),
        fc.constantFrom(' ', ''),
        fc.nat().filter((x) => x > 0),
        fc.constantFrom(' ', ''),
        fc.constantFrom('+', '-'),
        fc.constantFrom(' ', ''),
        fc.nat().filter((x) => x > 0),
        fc.constantFrom(' ', ''),
        (start, end, md, _, a, __, pm, ___, b, ____) => {
          const conversion = ([
            '',
            // ${unitA}
            [md, _, a, __, pm, ___, b, ____, '->'].join(''),
            // ${unitB}
            '',
          ] as unknown) as TemplateStringsArray;
          expect(Array.from(parseConversions(conversion, start, end))).toEqual([
            [
              start,
              Convert.linear(md === '*' ? a : 1 / a, pm === '+' ? b : -b),
              end,
            ],
          ]);
        },
      ),
    );
  });

  test('parsing stress test (no b term)', () => {
    fc.assert(
      fc.property(
        fc.string().map((name) => new Unit(name)),
        fc.string().map((name) => new Unit(name)),
        fc.array(fc.constantFrom(' ', ''), { minLength: 2, maxLength: 2 }),
        fc.nat().filter((x) => x > 0),
        (start, end, [_, __], a) => {
          const conversion = ([
            '',
            // ${unitA}
            ['*', _, a, __ + ' ', '->'].join(''),
            // ${unitB}
            '',
          ] as unknown) as TemplateStringsArray;
          expect(Array.from(parseConversions(conversion, start, end))).toEqual([
            [start, Convert.linear(a), end],
          ]);
        },
      ),
    );
  });
});