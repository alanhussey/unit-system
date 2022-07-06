import Convert, { Converter } from './Convert';
import Unit from './Unit';

// const DECLARATION_RE = /\s*([*/]\s?\d+(\.\d+)?)?\s?([+-]\s?\d+(\.\d+)?)?/;
// *
// /
// +
// -
// * +
// / +
// * -
// / -

const ARROW = '->';

const NUMERIC = /^\d+(\.\d+)?$/;
function isNumericString(str: string | undefined): str is string {
  return typeof str === 'string' && NUMERIC.test(str);
}

const declarationSyntaxError = (
  message: string,
  declaration: string,
  offset: number,
  length: number,
) =>
  new SyntaxError(
    [
      `${message}:`,
      `<unit>${declaration}<unit>`,
      `${' '.repeat(offset)}${'^'.repeat(length)}`,
    ].join('\n'),
  );

function missingNumberError(declaration: string, token: string) {
  const syntaxErrorOffset = '<unit>'.length + declaration.indexOf(token);
  return declarationSyntaxError(
    'Conversion declaration is invalid',
    declaration,
    syntaxErrorOffset,
    token.length,
  );
}

function unexpectedTokensError(declaration: string) {
  const startOfUnexpectedTokens = declaration.indexOf(ARROW) + ARROW.length;
  const syntaxErrorOffset = '<unit>'.length + startOfUnexpectedTokens;
  const excessTokensLength =
    declaration.trimEnd().length - startOfUnexpectedTokens;
  return declarationSyntaxError(
    'Unexpected token(s) after end of conversion declaration',
    declaration,
    syntaxErrorOffset,
    excessTokensLength,
  );
}

const tokenize = (declaration: string) =>
  Array.from(
    (function* () {
      let token = '';
      const chars = declaration.split('');
      while (chars.length) {
        const char = chars.shift();
        switch (char) {
          case ' ': {
            break;
          }

          case '*':
          case '/':
          case '+':
          case '-': {
            if (token !== '') {
              yield token;
              token = '';
            }
            if (char === '-' && chars[0] === '>') {
              chars.shift();
              yield ARROW;
            } else {
              yield char;
            }
            break;
          }

          default: {
            token += char;
            break;
          }
        }
      }
      if (token) {
        yield token;
      }
    })(),
  );

// Parse the string fragment declaring a conversion between two units.
// In this example, `declaration` is the string fragment between UNIT:
//     UNIT * a + b -> UNIT
//         ^^^^^^^^^^^^
function parseDeclaration(declaration: string) {
  let a = 1;
  let b = 0;

  const parseNextTokenAsFloat = () => {
    // we can guarantee that `token` is always a string because
    // a valid declaration always has an arrow (->) which
    // appears at the end, so there's always one more token.
    const token = tokens.shift() as string;
    if (isNumericString(token)) {
      return parseFloat(token);
    } else {
      throw missingNumberError(declaration, token);
    }
  };

  const tokens = tokenize(declaration);
  while (tokens.length > 0) {
    const token = tokens.shift();
    switch (token) {
      case '*': {
        a = parseNextTokenAsFloat();
        break;
      }

      case '/': {
        a = 1 / parseNextTokenAsFloat();
        break;
      }

      case '+': {
        b = parseNextTokenAsFloat();
        break;
      }

      case '-': {
        b = -parseNextTokenAsFloat();
        break;
      }

      case ARROW: {
        if (tokens.length > 0) {
          throw unexpectedTokensError(declaration);
        }
      }
    }
  }
  return Convert.linear(a, b);
}

export default function* parseConversions(
  fragments: TemplateStringsArray,
  ...args: Unit[]
): Generator<[Unit, Converter, Unit]> {
  for (let index = 0; index < fragments.length; index++) {
    const conversionDeclaration = fragments[index];
    if (conversionDeclaration.includes(ARROW)) {
      const start = args[index - 1];
      const end = args[index];
      const converter = parseDeclaration(conversionDeclaration);
      yield [start, converter, end];
    }
  }
}
