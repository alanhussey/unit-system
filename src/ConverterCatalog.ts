import {
  Converter,
  IDENTITY,
  LinearConverter,
  simplifyConverters,
} from './Convert';
import Unit from './Unit';
import DefaultMap from './DefaultMap';

export default class ConverterCatalog {
  private graph: DefaultMap<Unit, Map<Unit, Converter>>;

  constructor(edges: Iterable<[Unit, Converter, Unit]>) {
    this.graph = new DefaultMap(() => new Map());
    for (const [start, converter, end] of edges) {
      if (start === end) {
        throw new TypeError(
          'Cannot declare a conversion between a unit and itself',
        );
      }
      if (this.hasConverter(start, end)) {
        throw new TypeError(
          'Cannot declare two conversions for the same pair of units. ' +
            'Are you trying to declare the reverse of an existing conversion?',
        );
      }

      this.setConverter(start, end, converter);
    }
  }

  // store a conversion and its inverse between two units
  private setConverter(start: Unit, end: Unit, converter: Converter) {
    this.graph.get(start).set(end, converter);
    if (
      converter instanceof LinearConverter &&
      !this.hasConverter(end, start)
    ) {
      this.graph.get(end).set(start, converter.inverse);
    }
  }

  private hasConverter(start: Unit, end: Unit) {
    return this.graph.get(start).has(end);
  }

  // a modified breadth-first search – instead of returning the path between
  // the given nodes (units), return the edges (sequence of conversions) between them
  private getShortestPath(start: Unit, end: Unit) {
    // `paths` is a Map from `start` to each Unit we check, with the value being
    // an array of the converters needed to get from `start` to the given key.
    const paths = new Map<Unit, Converter[]>();

    // Handle the special case where `start` and `end` are the same Unit by
    // immediately return the identity converter.
    if (start === end) {
      return [IDENTITY];
    }

    // perform a breadth-first search, stopping when we've found a path that
    // reaches the requested `end` Unit
    const queue = [start];
    let node;
    while ((node = queue.shift())) {
      for (const [unit, converter] of this.graph.get(node)) {
        if (paths.has(unit)) continue;

        const path = (paths.get(node) || []).concat([converter]);
        if (unit === end) {
          return path;
        } else {
          paths.set(unit, path);
        }

        queue.push(unit);
      }
    }

    return null;
  }

  getConverter(start: Unit, end: Unit): Converter | null {
    const converters = this.getShortestPath(start, end);
    if (!converters) return null;
    const converter = simplifyConverters(converters);
    // cache a converter if it got simplified to make subsequent lookups faster
    if (converters.length > 1 && !this.hasConverter(start, end)) {
      this.setConverter(start, end, converter);
    }
    return converter;
  }
}
