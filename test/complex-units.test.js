const flow = require('lodash/flow');
const { multiplyBy } = require('../src/conversion');
const Unit = require('../src/Unit');
const Measurement = require('../src/Measurement');
const Converters = require('../src/UnitSystem/Converters');

// base class, indicating a unit that is not a "simple" single dimension
class ComplexUnit extends Unit {}

const NUMERATOR = Symbol('numerator');
const DENOMINATOR = Symbol('denominator');
class RateUnit extends ComplexUnit {
  constructor(
    numerator,
    denominator,
    name = `${numerator.name} per ${denominator.name}`
  ) {
    super(name);
    this[NUMERATOR] = numerator;
    this[DENOMINATOR] = denominator;
  }
  get numerator() {
    return this[NUMERATOR];
  }
  get denominator() {
    return this[DENOMINATOR];
  }
}

const sortUnits = units =>
  [...units].sort((a, b) => a.name.localeCompare(b.name));

const getCompoundName = units =>
  units
    .map(unit => (unit instanceof ComplexUnit ? `(${unit.name})` : unit.name))
    .join('×');

const UNITS = Symbol('units');
class CompoundUnit extends ComplexUnit {
  constructor(...args) {
    let name, units;
    if (typeof args[0] === 'string') {
      [name, ...units] = args;
    } else {
      //   units = args;
      units = sortUnits(args);
      name = getCompoundName(units);
    }

    super(name);
    this[UNITS] = units;
  }
  get units() {
    return [...this[UNITS]];
  }
}

const pow = n =>
  ({
    2: '²',
    3: '³',
  }[n] || `^${n}`);

class PowerUnit extends CompoundUnit {
  constructor(unit, power) {
    const name = `${unit.name}${pow(power)}`;
    super(name, ...new Array(power).fill(unit));
  }
}

//
//
//
//

function convertRate(measurement, unit) {
  const numerator = convert(
    new Measurement(measurement.value, measurement.unit.numerator),
    unit.numerator
  );
  const denominator = convert(
    new Measurement(1, measurement.unit.denominator),
    unit.denominator
  );
  return new Measurement(numerator.value / denominator.value, unit);
}

// Given two arrays of length X, return a new array of length X.
// The elements of the new array are the result of `getMatch`
// for each element in the first array, if `getMatch` does not
// return a nullish value.
// Intended for matching all the elements in the left array to
// a matching element in the right array.
// Consider this scenario:
//   const lowercase = ['a', 'b', 'c', 'd'];
//   const uppercase = ['C', 'D', 'A', 'B'];
//   const getMatchingLetter(left, right) {
//       if (left.toUpperCase() === right) {
//           return [left, right];
//       }
//   }
// We expect this result:
//   getMatches(lowercase, uppercase, getMatchingLetter)
//     -> [['a', 'A'], ['b', 'B'], ['c', 'C'], ['d', 'D']]
// For consistent behavior, `getMatch` must be defined in such a way
// that if left[0] can match with right[0] or right[1],
// and if left[1] can match with right[0], it must also match with right[1].
function getMatches(lefts, rights, getMatch) {
  // TODO:
  // assert(lefts.length === rights.length && lefts.length > 0);

  // We're gonna mutate this, so let's make a copy
  const rights_ = [...rights];

  return lefts.map(left => {
    // For each leftUnit, steal a matching rightUnit
    for (let index = 0; index < rights_.length; index++) {
      const right = rights_[index];
      const match = getMatch(left, right);
      if (match != null) {
        // remove the matched element
        rights_.splice(index, 1);
        return match;
      }
    }
  });
}

const converters = new Converters();
function findConverter(from, to) {
  if (from === to) {
    return x => x;
  }
  return converters.find(from, to);
}

function convertCompound(measurement, unit) {
  const leftUnits = [...measurement.unit.units];
  const rightUnits = [...unit.units];

  const converter = flow(
    // For each leftUnit, steal a matching rightUnit
    getMatches(leftUnits, rightUnits, findConverter)
  );

  return new Measurement(converter(measurement.value), unit);
}

///
///
///

function convert(measurement, unit) {
  const [, convertForUnitType] =
    [
      [RateUnit, convertRate],
      [CompoundUnit, convertCompound],
      // [PowerUnit, convertCompound],
    ].find(
      ([Subclass]) =>
        measurement.unit instanceof Subclass && unit instanceof Subclass
    ) || [];

  if (!convertForUnitType) {
    return new Measurement(
      findConverter(measurement.unit, unit)(measurement.value),
      unit
    );
  }
  return convertForUnitType(measurement, unit);
}

const thing = new Unit('thing');
const gram = new Unit('gram');
const kilogram = new Unit('kilogram');
converters.add(kilogram, gram, multiplyBy(1000));
const centimeter = new Unit('centimeter');
const meter = new Unit('meter');
converters.add(meter, centimeter, multiplyBy(100));

const cubicCentimeters = new PowerUnit(centimeter, 3);
const cubicMeters = new PowerUnit(meter, 3);

test('power', () => {
  // 1,000,000 cm^3 -> 1 m^3
  const converted = convert(
    new Measurement(1000000, cubicCentimeters),
    cubicMeters
  );
  expect(converted).toEqual(new Measurement(1, cubicMeters));
});

test('compound', () => {
  // 100 thing-gram-meters -> 1 thing-gram-centimeter
  const converted = convert(
    new Measurement(100, new CompoundUnit(thing, gram, centimeter)),
    new CompoundUnit(meter, thing, gram)
  );
  expect(converted).toEqual(
    new Measurement(1, new CompoundUnit(thing, meter, gram))
  );
});

test('rate', () => {
  // 13.6g/cm^3 -> 13600 kg/m^3
  const converted = convert(
    new Measurement(13.6, new RateUnit(gram, cubicCentimeters)),
    new RateUnit(kilogram, cubicMeters)
  );
  expect(converted).toEqual(
    new Measurement(13600, new RateUnit(kilogram, cubicMeters))
  );
});
