const Unit = require('../Unit');
const Aliases = require('./Aliases');

describe(Aliases, () => {
  let aliases;
  beforeEach(() => {
    aliases = new Aliases();
  });

  describe('#set', () => {
    it('requires aliases to be strings', () => {
      expect(() => {
        aliases.set(123);
      }).toThrow(new TypeError('Alias must be a string - got "123" instead'));
    });

    it('tracks units by alias', () => {
      const inch = new Unit('inch');
      aliases.set('inches', inch);
      expect(aliases.get('inches')).toBe(inch);
    });

    it('requires units to be Unit instances', () => {
      const inch = { name: 'inch' };
      expect(() => {
        aliases.set('inches', inch);
      }).toThrow(
        new TypeError(
          'Aliased unit must be a Unit instance - got "{"name":"inch"}" instead'
        )
      );
    });

    it('throws if an alias is used twice for two different units', () => {
      const inch = new Unit('inch');
      aliases.set('inches', inch);
      const inch2 = new Unit('imposter inch');

      expect(() => {
        aliases.set('inches', inch2);
      }).toThrowError(
        new Error(
          'Cannot register "{"name":"imposter inch"}" under the alias "inches" - that alias is already taken by "{"name":"inch"}"'
        )
      );
    });

    it('can also be called with `add`', () => {
      const inch = new Unit('inch');
      aliases.add('inches', inch);
      expect(aliases.get('inches')).toBe(inch);
    });
  });

  describe('#has', () => {
    it('returns false if the given alias has not been set', () => {
      expect(aliases.has('inches', null)).toBe(false);
    });

    it('returns false if the given unit is not defined for the given alias', () => {
      const inch = new Unit('inch');
      const foot = new Unit('foot');
      aliases.add('inches', foot);
      expect(aliases.has('inches', inch)).toBe(false);
    });

    it('returns true if the given unit is defined for the given alias', () => {
      const inch = new Unit('inch');
      aliases.add('inches', inch);
      expect(aliases.has('inches', inch)).toBe(true);
    });
  });
});
