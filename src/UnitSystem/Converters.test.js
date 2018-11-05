const Unit = require('../Unit');
const { divideBy } = require('../conversion');
const Converters = require('./Converters');

describe(Converters, () => {
  describe('#add', () => {
    it('stores converter to and from one unit to another', () => {
      const inch = new Unit('inch');
      const foot = new Unit('foot');

      const convert = divideBy(12);
      const converters = new Converters();
      converters.add(inch, foot, convert);

      expect(Array.from(converters.registry)).toEqual([
        [inch, new Map([[foot, convert.forward]])],
        [foot, new Map([[inch, convert.backward]])],
      ]);
    });

    it('throws when a converter is registered for the same unit', () => {
      const inch = new Unit('inch');
      const converters = new Converters();

      expect(() => {
        converters.add(inch, inch, divideBy(1));
      }).toThrowError(
        new Error('Cannot define conversion from a unit to itself (inch)')
      );
    });
  });

  describe('#find', () => {
    it('returns the converter from one unit to another', () => {
      const inch = new Unit('inch');
      const foot = new Unit('foot');

      const convert = divideBy(12);
      const converters = new Converters();
      converters.add(inch, foot, convert);

      expect(converters.find(inch, foot)).toBe(convert.forward);
    });

    it('returns null if it cannot find a converter', () => {
      const inch = new Unit('inch');
      const foot = new Unit('foot');
      const quart = new Unit('quart');
      const gallon = new Unit('gallon');

      const converters = new Converters();
      converters.add(inch, foot, divideBy(12));
      converters.add(quart, gallon, divideBy(4));

      expect(converters.find(inch, gallon)).toBe(null);
    });

    it('can combine multiple converters', () => {
      const inch = new Unit('inch');
      const foot = new Unit('foot');
      const yard = new Unit('yard');

      const converters = new Converters();
      converters.add(inch, foot, divideBy(12));
      converters.add(foot, yard, divideBy(3));

      const inchesToYards = converters.find(inch, yard);

      expect(inchesToYards(36)).toBe(1);
    });

    it('caches multi-step converters', () => {
      const inch = new Unit('inch');
      const foot = new Unit('foot');
      const yard = new Unit('yard');

      const converters = new Converters();
      converters.add(inch, foot, divideBy(12));
      converters.add(foot, yard, divideBy(3));

      const inchesToYards = converters.find(inch, yard);

      expect(converters.find(inch, yard)).toBe(inchesToYards);
    });
  });
});
