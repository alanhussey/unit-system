const flow = require('lodash/flow');
const Graph = require('node-dijkstra');

const DefaultMap = require('./DefaultMap');

// getEdges([a, b, c, d]) =>
//   [ [a, b], [b, c], [c, d] ]
function getEdges(path) {
  const edges = [];
  for (let i = 0; i < path.length - 1; i++) {
    const edge = path.slice(i, i + 2);
    edges.push(edge);
  }
  return edges;
}

class Converters {
  constructor() {
    this.registry = new DefaultMap(() => new Map());
    this._edges = new DefaultMap(() => new Map());
  }

  add(startUnit, endUnit, converter) {
    if (startUnit === endUnit) {
      throw new Error(
        `Cannot define conversion from a unit to itself (${startUnit.name})`
      );
    }
    this._addPair(startUnit, endUnit, converter.forward);
    this._addPair(endUnit, startUnit, converter.backward);
  }

  _addPair(startUnit, endUnit, convert, cost = 1) {
    if (this.registry.get(startUnit).has(endUnit)) {
      throw new Error(
        `Cannot define conversion from ${startUnit.name} to ${
          endUnit.name
        } - conversion already exists`
      );
    }
    this.registry.get(startUnit).set(endUnit, convert);
    this._edges.get(startUnit).set(endUnit, cost);
  }

  find(from, to) {
    // Try the simple path first
    return this._findShallow(from, to) || this._findDeep(from, to) || null;
  }

  _findShallow(from, to) {
    return this.registry.get(from).get(to);
  }

  _findDeep(from, to) {
    const graph = new Graph(this._edges);
    const { path, cost } = graph.path(from, to, { cost: true });

    if (!path) return null;

    const edges = getEdges(path);
    const converters = edges.map(([f, t]) => this.find(f, t));
    const converter = flow(converters);

    // Cache this lookup so next time we can `_findShallow` instead
    this._addPair(from, to, converter, cost);

    return converter;
  }
}

module.exports = Converters;
