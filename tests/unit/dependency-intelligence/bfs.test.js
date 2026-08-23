const { bfs } = require('../../../src/modules/dependency-intelligence/bfs');

/**
 * Builds a getNeighbors() function from a plain adjacency map, e.g.
 * { A: [{ id: 'B', usesProtocol: 'RESTAPI' }], B: [{ id: 'C' }] }.
 */
const graphOf = (adjacency) => async (nodeId) => adjacency[nodeId] ?? [];

describe('bfs', () => {
  it('returns an empty array for a node with no outgoing edges', async () => {
    const getNeighbors = graphOf({ A: [] });
    await expect(bfs('A', getNeighbors)).resolves.toEqual([]);
  });

  it('assigns increasing hop counts along a straight-line chain', async () => {
    const getNeighbors = graphOf({
      A: [{ id: 'B' }],
      B: [{ id: 'C' }],
      C: [{ id: 'D' }],
      D: [],
    });

    const result = await bfs('A', getNeighbors);

    expect(result).toEqual([
      { id: 'B', hop: 1, edge: {} },
      { id: 'C', hop: 2, edge: {} },
      { id: 'D', hop: 3, edge: {} },
    ]);
  });

  it('discovers a diamond-convergence node exactly once, at its shortest hop count', async () => {
    // A -> B -> D
    // A -> C -> D
    const getNeighbors = graphOf({
      A: [{ id: 'B' }, { id: 'C' }],
      B: [{ id: 'D' }],
      C: [{ id: 'D' }],
      D: [],
    });

    const result = await bfs('A', getNeighbors);
    const ids = result.map((r) => r.id);

    expect(ids).toEqual(expect.arrayContaining(['B', 'C', 'D']));
    expect(ids.filter((id) => id === 'D')).toHaveLength(1);
    expect(result.find((r) => r.id === 'D').hop).toBe(2);
  });

  it('never revisits the start node even if a cycle leads back to it', async () => {
    const getNeighbors = graphOf({
      A: [{ id: 'B' }],
      B: [{ id: 'A' }],
    });

    const result = await bfs('A', getNeighbors);

    expect(result).toEqual([{ id: 'B', hop: 1, edge: {} }]);
  });

  it('excludes nodes unreachable from the start node', async () => {
    const getNeighbors = graphOf({
      A: [{ id: 'B' }],
      B: [],
      X: [{ id: 'Y' }],
      Y: [],
    });

    const result = await bfs('A', getNeighbors);

    expect(result.map((r) => r.id)).toEqual(['B']);
  });

  it('truncates the traversal at maxDepth', async () => {
    const getNeighbors = graphOf({
      A: [{ id: 'B' }],
      B: [{ id: 'C' }],
      C: [{ id: 'D' }],
      D: [],
    });

    const result = await bfs('A', getNeighbors, { maxDepth: 2 });

    expect(result.map((r) => r.id)).toEqual(['B', 'C']);
  });

  it('carries edge metadata through to the result, keyed under `edge`', async () => {
    const getNeighbors = graphOf({
      A: [{ id: 'B', usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' }],
      B: [],
    });

    const result = await bfs('A', getNeighbors);

    expect(result).toEqual([
      { id: 'B', hop: 1, edge: { usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' } },
    ]);
  });
});
