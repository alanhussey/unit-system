export const ARROW = '->';

export default function* tokenize(declaration: string): Generator<string> {
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
}
