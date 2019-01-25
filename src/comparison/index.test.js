const Measurement = require('../Measurement');
const Unit = require('../Unit');
const {
  equal,
  lessThan,
  lessThanOrEqual,
  greaterThan,
  greaterThanOrEqual,
} = require('./');

const inch = new Unit('inch');
const foot = new Unit('foot');

function testUnitSafety(comparisonFn, symbol) {
  it(`throws if the given values are not measurements (${symbol})`, () => {
    expect(() => {
      comparisonFn(1, new Measurement(1, inch));
    }).toThrowError(
      new TypeError(`Expected a Measurement but got ${1} instead`)
    );
    expect(() => {
      comparisonFn(new Measurement(2, inch), 2);
    }).toThrowError(
      new TypeError(`Expected a Measurement but got ${2} instead`)
    );
  });
  it(`throws if the two measurements are not the same unit (${symbol})`, () => {
    expect(() => {
      comparisonFn(new Measurement(12, inch), new Measurement(1, foot));
    }).toThrowError(new TypeError('Measurements must be of the same unit'));
  });
}

function testComparison(compare, symbol, ...testCases) {
  it.each(testCases)(
    `for "%s ${symbol} %s", it returns %s`,
    (left, right, expected) => {
      expect(
        compare(new Measurement(left, inch), new Measurement(right, inch))
      ).toBe(expected);
    }
  );
}

describe(equal, () => {
  testUnitSafety(equal, '==');

  testComparison(
    equal,
    '==',

    [12, 12, true],
    [12, 13, false]
  );
});

describe(lessThan, () => {
  testUnitSafety(lessThan, '<');
  testComparison(
    lessThan,
    '<',

    [1, 2, true],
    [2, 1, false],
    [4, 4, false]
  );
});

describe(lessThanOrEqual, () => {
  testUnitSafety(lessThanOrEqual, '<=');
  testComparison(
    lessThanOrEqual,
    '<=',

    [1, 2, true],
    [2, 1, false],
    [4, 4, true]
  );
});

describe(greaterThan, () => {
  testUnitSafety(greaterThan, '>');
  testComparison(
    greaterThan,
    '>',

    [2, 1, true],
    [1, 2, false],
    [4, 4, false]
  );
});

describe(greaterThanOrEqual, () => {
  testUnitSafety(greaterThanOrEqual, '>=');
  testComparison(
    greaterThanOrEqual,
    '>=',

    [2, 1, true],
    [1, 2, false],
    [4, 4, true]
  );
});
