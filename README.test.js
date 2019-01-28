const groupBy = require('lodash/groupBy');
const partition = require('lodash/partition');

const README = require('fs').readFileSync('./README.md', { encoding: 'utf8' });

describe('README', () => {
  const blocksByHeading = getFencedCodeBlocksByHeading(README);

  it('can run the demo', () => {
    const [[, , demoCode]] = blocksByHeading['Demo'];
    const code = demoCode + "\n return 'SUCCESS!';";

    const globals = { require: () => require('./src') };

    const demoFn = wrapCodeWithGlobals(code, globals);

    expect(() => demoFn()).not.toThrowError();
    expect(demoFn()).toBe('SUCCESS!');
  });

  describe.each(Object.entries(blocksByHeading))('%s', (group, blocks) => {
    it.each(blocks)(
      'example #%s does not throw a SyntaxError',
      (number, title, block) => {
        expect(() => new Function(block)()).not.toThrowError(SyntaxError);
      }
    );

    // Blocks that are currently not runnable without significant work
    const BROKEN_BLOCKS = [3, 17, 20, 22, 24];
    const [skippedBlocks, runnableBlocks] = partition(blocks, ([number]) =>
      BROKEN_BLOCKS.includes(number)
    );

    it.skip.each(skippedBlocks)('example #%s runs', (number, title, block) => {
      expect(() => runCodeBlock(block)).not.toThrowError();
    });

    it.each(runnableBlocks)('example #%s runs', (number, title, block) => {
      expect(() => runCodeBlock(block)).not.toThrowError();
    });
  });
});

class GlobalsFactory {
  constructor() {
    const lib = require('./src');
    this.require = () => path => ({ 'unit-system': lib }[path]);

    const { conversion, createUnitSystem } = lib;

    this._exposePropertiesAsFactories(lib);
    this._exposePropertiesAsFactories(conversion);

    const sys = this._createGlobalUnitSystem(createUnitSystem, conversion);
    this._exposePropertiesAsFactories(sys);
  }

  _exposePropertiesAsFactories(donor, keys = Object.keys(donor)) {
    Object.assign(
      this,
      keys.reduce(
        (obj, key) => ({
          ...obj,
          [key]: () => donor[key],
        }),
        {}
      )
    );
  }

  _createGlobalUnitSystem(createUnitSystem, conversion) {
    const sys = createUnitSystem();
    const { system, createUnit } = sys;

    this.inch = () => system.getUnitForAlias('inches');
    this.foot = () => system.getUnitForAlias('feet');
    this.centimeter = () => system.getUnitForAlias('cm');
    this.kilometer = () => system.getUnitForAlias('km');
    this.mile = () => system.getUnitForAlias('mile');

    createUnit('inch', { alias: ['in', 'inches'] });
    createUnit('foot', {
      alias: ['foot', 'feet'],
      convert: { from: [this.inch(), conversion.divideBy(12)] },
    });
    createUnit('mile', {
      alias: 'mile',
      convert: {
        to: [this.foot(), conversion.multiplyBy(5280)],
      },
    });
    createUnit('centimeter', {
      alias: 'cm',
      convert: { from: [this.inch(), conversion.times(2.54)] },
    });
    createUnit('kilometer', {
      alias: 'km',
      convert: { from: [this.centimeter(), conversion.divideBy(1000)] },
    });

    return sys;
  }
}

// Repeatedly run a code block, attempting to provide
// any implicit dependencies by watching for `ReferenceError`.
function runCodeBlock(block) {
  const globalsFactories = new GlobalsFactory();
  const globals = {};
  let blockFn = wrapCodeWithGlobals(block, globals);

  // Maximum number (n+1) of implicit globals to resolve before giving up.
  let remainingAttempts = 5;
  let completed = false;

  while (!completed) {
    --remainingAttempts;

    try {
      blockFn();
      completed = true;
    } catch (error) {
      if (!(error instanceof ReferenceError)) {
        throw error;
      }

      const [, reference] = error.message.match(/(.+) is not defined/);
      if (remainingAttempts < 0) {
        throw new Error(`Too many attempts. Got stuck on "${reference}"`);
      }

      const factory = globalsFactories[reference];
      globals[reference] = factory();
    }
  }
}

// Give a string of JS and an object, run the JS with the given object values
// as globals.
// Depends on object iteration being consistent.
function wrapCodeWithGlobals(code, globals) {
  return () =>
    new Function(...Object.keys(globals), code)(...Object.values(globals));
}

// In a markdown document, find every fenced code block,
// and group them by the title from the most recent markdown heading.
//  => {heading: [blocks]}
function getFencedCodeBlocksByHeading(markdown) {
  const FENCED_CODE_BLOCK = '```js(.+?)```';

  // (I'm sorry)
  const codeBlocks = markdown
    // Find each substring that looks like a fenced code block
    .match(new RegExp(FENCED_CODE_BLOCK, 'gs'))
    // For each substring, extract the code (ignoring the fence)
    .map(block => block.match(new RegExp(FENCED_CODE_BLOCK, 's'))[1].trim())
    // Enumerate each block, and include the heading
    .map((block, index) => [
      index + 1,
      findHeadingForBlock(block, markdown),
      block,
    ]);

  return groupBy(codeBlocks, 1);
}

function findHeadingForBlock(block, markdown) {
  // Any markdown header demarcated with `#` (ignoring level-1 headings)
  const HEADING = '#{2,} `?([^`^\n]+)`?';

  // Narrow search to any content before the given code block
  const everythingBeforeBlock = markdown.slice(0, markdown.indexOf(block));

  // Find every substring that looks like a markdown heading
  const allCandidates = everythingBeforeBlock.match(new RegExp(HEADING, 'g'));

  // Grab the last one
  const lastCandidate = allCandidates[allCandidates.length - 1];

  // Throw away cruft
  return lastCandidate.match(new RegExp(HEADING))[1];
}
