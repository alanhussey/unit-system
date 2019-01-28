# `unit-system`

ΜΕΤΡΩ ΧΡΩ

_Use the measure_

A library for defining unit systems and performing unit-safe calculations

## Demo

```js
const { createUnitSystem, conversion } = require('unit-system');

const { createUnit, m, equal, add } = createUnitSystem();

const inch = createUnit('inch');
const yard = createUnit('yard', {
  alias: ['yd', 'yard', 'yards'],
});

const foot = createUnit('foot', {
  alias: 'feet',
  convert: {
    to: [yard, conversion.divideBy(3)],
    from: [inch, conversion.divideBy(12)],
  },
});

const twoYards = add(m`1 yard`, m`3 feet`);

equal(twoYards, m(72, inch)) === true;
```

## Documentation

### `createUnitSystem(units)`

Most uses of `unit-system` start with `createUnitSystem()`.

```js
const { createUnitSystem } = require('unit-system');

const { createUnit, m, convert, system } = createUnitSystem();
```

#### `createUnit(name, options)`

Creates a new `Unit` and automatically registers it with `system` (the `UnitSystem` created by `createUnitSystem`).

```js
const inch = createUnit('inch', { alias: 'inches' });

const foot = createUnit('foot', {
  convert: {
    from: [inch, conversion.divideBy(12)],
  },
});
```

#### `m(number, unit)`

Shorthand function for creating new `Measurement` instances. If a unit is defined with an alias, that alias can be used instead of passing in the unit.

```js
// All of are equivalent to `new Measurement(12, inch)`
m`12 inches`;
m`12inches`;
m`12 ${inch}`;
m`12`.inches;
m(12).inches;
m(12, inch);
```

#### `convert(measurement, unit)`

Given a `Measurement` and a `Unit`, `convert(measurement, unit)` will attempt to convert that measurement to the given unit. (see `UnitSystem#convert()` for details)

```js
convert(m`24 inches`, foot);
// => new Measurement(2, foot)
```

#### `system`

The `UnitSystem` created by `createUnitSystem`.

### `conversion`

A collection of converter creators. A converter is an object with `forward` and `backward` methods, meant for converting between two units.

Converters shouldn't be used directly. Instead, define them when creating a unit, and `UnitSystem` will be able to automatically convert for you.

```js
const { conversion } = require('unit-system');
```

#### `conversion.slopeIntercept(slope, intercept = 0)`

Given a `slope` and an optional `intercept`, produces a converter.

_Also exported as: `multiplyBy`, `times`_

```js
const celsiusToFahrenheit = conversion.slopeIntercept(9 / 5, 32);

celsiusToFahrenheit.forward(100) === 212;
celsiusToFahrenheit.backward(32) === 0;
```

#### `conversion.divideBy(divisor)`

A special case of `multiplyBy`, useful when defining the reverse conversion is clearer.

```js
const feetToInches = conversion.divideBy(12);

feetToInches.forward(3) === 36;
feetToInches.backward(12) === 1;
```

#### `conversion.twoPoint([x1, y1], [x2, y2])`

Given two example points on a line, produces a converter. Useful when a conversion can be more clearly expressed in terms of easily-understood examples.

_Also exported as: `fromExamples`, `byExample`_

```js
const freezing = [0, 32];
const boiling = [100, 212];
const celsiusToFahrenheit = conversion.twoPoint(freezing, boiling);

celsiusToFahrenheit.forward(100) === 212;
celsiusToFahrenheit.backward(32) === 0;
```

#### `conversion.addConstant(constant)`

Given a constant value, produces a converter. A special case of `slopeIntercept` where `slope` is always `1`.

_Also exported as: `add`, `constant`_

```js
const celsiusToKelvin = conversion.addConstant(273.15);

celsiusToKelvin.forward(0) === 273.15;
celsiusToKelvin.backward(-272.15) === 1;
```

### `new Unit(name)`

The base unit type.

```js
const { Unit } = require('unit-system');

const inch = new Unit('inch');

inch.name === 'inch';
```

### `new Measurement(number, unit)`

A value type representing a number and its unit.

```js
const { Measurement } = require('unit-system');

const oneInch = new Measurement(1, inch);

oneInch.value === 1;
oneInch.unit === inch;
```

### `new UnitSystem(units)`

A collection of units. Internally tracks aliases for units (used by `m` to look up the corresponding unit) and converters.

```js
const { UnitSystem } = require('unit-system');

const myUnitSystem = new UnitSystem([
  [inch, { alias: 'inches' }],
  [foot, { convert: { from: [inch, conversion.divideBy(12)] } }],
]);

myUnitSystem.getUnitForAlias('inches') === inch;

myUnitSystem.convert(new Measurement(12, inch), foot);
// => new Measurement(1, foot)
```

#### `.merge(...unitSystems)`

Takes one or more other `UnitSystem`s and copies this unit into this one.

```js
const mySystem = new UnitSystem([[new Unit('inch'), { alias: 'inches' }]]);

const systemA = new UnitSystem([[new Unit('foot')]]);
const systemB = new UnitSystem([[new Unit('yard')]]);
const systemC = new UnitSystem([[new Unit('mile')]]);

mySystem.merge(systemA, systemB, systemC);
```

#### `.register(unit, { alias, convert })`

Registers the given unit within the system.

```js
const inch = new Unit('inch');
system.register(inch);
```

If `alias` is provided, that unit can now be referenced by that alias.

```js
system.register(inch, { alias: 'inches' });
```

If `convert` is provided, its properties `to` and `from` are used to register converters between two units.

```js
system.register(inch, {
  convert: {
    to: [centimeter, multiplyBy(2.54)],
    from: [foot, divideBy(12)],
  },
});
```

#### `.registerAll(units)`

Like the first argument to `new UnitSystem(units)`, registers all the given units.

#### `.addConverter(startUnit, endUnit, converter)`

Adds a converter for units that have already been registered.

```js
const inch = new Unit('inch');
const foot = new Unit('foot');
const system = new UnitSystem([[inch], [foot]]);
system.addConverter(inch, foot, divideBy(12));
```

#### `.getUnitForAlias(alias)`

Looks up the corresponding unit for the given alias.

```js
system.getUnitForAlias('inches') === inch;
```

#### `.convert(measurement, unit|string)`

`convert` will take the given measurement and attempt to convert it the desired unit. It may take multiple hops to make that happen.

If `unit` is a string, `convert` will assume it is an alias and will look up the corresponding unit.

Consider a `UnitSystem` that defines kilometers, meters, centimeters, inches, feet, and miles:

```js
const kilometer = createUnit('kilometer');
const meter = createUnit('meter', {
  convert: {
    from: [kilometer, conversion.multiplyBy(1000)],
  },
});
const centimeter = createUnit('centimeter', {
  convert: {
    from: [meter, conversion.multiplyBy(100)],
  },
});

const inch = createUnit('inch', {
  convert: {
    to: [centimeter, conversion.multiplyBy(2.54)],
  },
});
const foot = createUnit('foot', {
  convert: {
    from: [inch, conversion.divideBy(12)],
  },
});
const mile = createUnit('mile', {
  alias: 'mile',
  convert: {
    to: [foot, conversion.multiplyBy(5280)],
  },
});
```

It can convert miles to kilometers, even though a converter between those two was never explicitly declared:

```js
const oneMileInKilometers = system.convert(m`1 mile`, kilometer);
oneMileInKilometers.value === 1.609344;
```

When a multi-step converter is created, it will be cached, to save on the lookup time.

#### `.add(...measurements)`

`add` will take the given measurements and attempt to add them together, converting them if needed.

Consider a `UnitSystem` that defines centimeters, inches, and feet:

```js
const centimeter = createUnit('centimeter');
const inch = createUnit('inch', {
  alias: 'inches',
  convert: {
    to: [centimeter, conversion.multiplyBy(2.54)],
  },
});
const foot = createUnit('foot', {
  alias: 'feet',
  convert: {
    from: [inch, conversion.divideBy(12)],
  },
});
```

It can add up several values in each of those units, converting them to the same unit:

```js
const eightFeet = system.add(
  m`2 feet`,
  m`18 inches`,
  m`2 inches`,
  m(15.24, centimeter),
  m`10 inches`,
  m`3 feet`
);
eightFeet.value === 8;
eightFeet.unit === foot;
```

#### `.subtract(measurement1, measurement2)`

`subtract` will take the two given measurements and attempt to subtract them, converting them if needed.

Consider a `UnitSystem` that defines centimeters and inches:

```js
const centimeter = createUnit('centimeter');
const inch = createUnit('inch', {
  alias: 'inches',
  convert: {
    to: [centimeter, conversion.multiplyBy(2.54)],
  },
});
```

It can subtract two values in either of those units, converting them to the same unit:

```js
const eighteenInches = system.subtract(m`24 inches`, m(15.24, centimeter));
eighteenInches.value === 18;
eighteenInches.unit === inch;
```

`subtract` does not support operating on more than 2 measurements at a time.

#### `.multiply(measurement, ...numbers)`

`multiply` will take the a measurement and multiply it with one or more numbers. The order of arguments is not important. Only one measurement can be supplied.

```js
const twelveInches = system.multiply(m`4 inches`, 3);
twelveInches.value === 12;
twelveInches.unit === inch;
```

#### `.divide(measurement, measurement|number)`

`divide` will take a measurement and divide it by the second argument, returning either another measurement or a number, depending on the type of the second argument.

```js
const fourInches = system.divide(m`12 inches`, 3);
fourInches.value === 4;
fourInches.unit === inch;
```

```js
system.divide(m`18 inches`, m`6 inches`) === 3;
```

It will also automatically convert units when dividing two measurements:

```js
system.divide(m`3 feet`, m`18 inches`) === 2;
```

#### `.equal(measurement, measurement)`

`equal` will return `true` if the two measurements have the same value and unit (after conversion). Otherwise it returns `false`.

```js
system.equal(m`12 inches`, m`1 foot`) === true;
```

#### `.lessThan(measurement, measurement)`

`lessThan` will return `true` if the first measurement is less than the second (after conversion). Otherwise it returns `false`.

#### `.lessThanOrEqual(measurement, measurement)`

`lessThanOrEqual` will return `true` if the first measurement is less than or equal to the second (after conversion). Otherwise it returns `false`.

#### `.greaterThan(measurement, measurement)`

`greaterThan` will return `true` if the first measurement is greater than the second (after conversion). Otherwise it returns `false`.

#### `.greaterThanOrEqual(measurement, measurement)`

`greaterThanOrEqual` will return `true` if the first measurement is greater than or equal to the second (after conversion). Otherwise it returns `false`.
