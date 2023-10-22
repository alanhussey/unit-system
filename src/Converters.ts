import {
  Converter,
  IDENTITY,
  LinearConverter,
  simplifyConverters,
} from './Convert';
import Unit from './Unit';
import DefaultMap from './DefaultMap';

type Edge = [Unit, Converter, Unit];

export default class Converters implements Iterable<Edge> {
  private graph: DefaultMap<Unit, Map<Unit, Converter>>;

  constructor(edges: Iterable<Edge>) {
    this.graph = new DefaultMap(() => new Map());
    for (const [start, converter, end] of edges) {
      this.set(start, end, converter);
    }
  }

  *[Symbol.iterator]() {
    const seen: DefaultMap<Unit, Set<Unit>> = new DefaultMap(() => new Set());
    for (const [start, converters] of this.graph) {
      for (const [end, converter] of converters) {
        // if the inverse has already been seen, skip this one
        if (seen.get(end).has(start)) continue;
        seen.get(start).add(end);
        yield <Edge>[start, converter, end];
      }
    }
  }

  // store a conversion and its inverse between two units
  private set(start: Unit, end: Unit, converter: Converter) {
    if (start === end) {
      throw new TypeError(
        'Cannot declare a conversion between a unit and itself',
      );
    }
    if (this.has(start, end)) {
      throw new TypeError(
        'Cannot declare two conversions for the same pair of units. ' +
          'Are you trying to declare the reverse of an existing conversion?',
      );
    }
    this.graph.get(start).set(end, converter);
    if (converter instanceof LinearConverter && !this.has(end, start)) {
      this.graph.get(end).set(start, converter.inverse);
    }
  }

  private has(start: Unit, end: Unit) {
    return this.graph.get(start).has(end);
  }

  // a modified breadth-first search – instead of returning the path between
  // the given nodes (units), return the edges (sequence of conversions) between them
  private getShortestPath(start: Unit, end: Unit) {
    // Handle the special case where `start` and `end` are the same Unit by
    // immediately returning the identity converter.
    if (start === end) {
      return [IDENTITY];
    }

    // Happy path: a converter exists directly between `start` and `end`
    if (this.has(start, end)) {
      const converter = this.graph.get(start).get(end) as Converter;
      return [converter];
    }

    // Finally, perform a breadth-first search, stopping when we've found a path that
    // reaches the requested `end` Unit
    const queue = [start];

    // `paths` is a Map from `start` to each Unit we check, with the value being
    // an array of the converters needed to get from `start` to the given key.
    const paths = new Map<Unit, Converter[]>();

    let node;
    while ((node = queue.shift())) {
      for (const [unit, converter] of this.graph.get(node)) {
        if (paths.has(unit)) continue;

        const path = (paths.get(node) || []).concat([converter]);
        if (unit === end) {
          return path;
        }

        paths.set(unit, path);
        queue.push(unit);
      }
    }

    return null;
  }

  get(start: Unit, end: Unit): Converter | null {
    const converters = this.getShortestPath(start, end);
    if (!converters) return null;
    const converter = simplifyConverters(converters);
    // cache a converter if it got simplified to make subsequent lookups faster
    if (converters.length > 1 && !this.has(start, end)) {
      this.set(start, end, converter);
    }
    return converter;
  }
}
