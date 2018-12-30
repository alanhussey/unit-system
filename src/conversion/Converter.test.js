const Converter = require('./Converter');

describe(Converter, () => {
  describe('#forward', () => {
    it('exists', () => {
      const converter = new Converter();

      expect(converter.forward).toBeInstanceOf(Function);
    });

    it('throws if not overridden', () => {
      class SpecialConverter extends Converter {}

      const converter = new SpecialConverter();
      expect(() => converter.forward()).toThrowError(
        new Error('`forward` has not been implemented in SpecialConverter')
      );
    });
  });

  describe('#backward', () => {
    it('exists', () => {
      const converter = new Converter();

      expect(converter.backward).toBeInstanceOf(Function);
    });

    it('throws if not overridden', () => {
      class SpecialConverter extends Converter {}

      const converter = new SpecialConverter();
      expect(() => converter.backward()).toThrowError(
        new Error('`backward` has not been implemented in SpecialConverter')
      );
    });
  });
});
