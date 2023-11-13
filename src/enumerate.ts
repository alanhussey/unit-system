export default function* enumerate<T>(iterable: Iterable<T>): Generator<[number, T]> {
  let index = 0;
  for (const element of iterable) {
    yield [index++, element];
  }
}
