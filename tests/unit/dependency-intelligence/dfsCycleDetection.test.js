const { detectCycle } = require('../../../src/modules/dependency-intelligence/dfsCycleDetection');

const graphOf = (adjacency) => async (nodeId) => adjacency[nodeId] ?? [];

describe('detectCycle', () => {
  it('returns null for a node with no outgoing edges', async () => {
    const getNeighbors = graphOf({ A: [] });
    await expect(detectCycle(['A'], getNeighbors)).resolves.toBeNull();
  });

  it('returns null for an acyclic diamond graph', async () => {
    const getNeighbors = graphOf({
      A: [{ id: 'B' }, { id: 'C' }],
      B: [{ id: 'D' }],
      C: [{ id: 'D' }],
      D: [],
    });

    await expect(detectCycle(['A'], getNeighbors)).resolves.toBeNull();
  });

  it('detects a direct two-node cycle (A -> B -> A)', async () => {
    const getNeighbors = graphOf({
      A: [{ id: 'B' }],
      B: [{ id: 'A' }],
    });

    await expect(detectCycle(['A'], getNeighbors)).resolves.toEqual(['A', 'B', 'A']);
  });

  it('detects a longer cycle (A -> B -> C -> A)', async () => {
    const getNeighbors = graphOf({
      A: [{ id: 'B' }],
      B: [{ id: 'C' }],
      C: [{ id: 'A' }],
    });

    await expect(detectCycle(['A'], getNeighbors)).resolves.toEqual(['A', 'B', 'C', 'A']);
  });

  it('detects a self-loop (A -> A)', async () => {
    const getNeighbors = graphOf({ A: [{ id: 'A' }] });
    await expect(detectCycle(['A'], getNeighbors)).resolves.toEqual(['A', 'A']);
  });

  it('does not flag a diamond convergence (two paths to the same node) as a cycle', async () => {
    // B and C both point to D — a legitimate DAG shape, not a cycle.
    const getNeighbors = graphOf({
      A: [{ id: 'B' }, { id: 'C' }],
      B: [{ id: 'D' }],
      C: [{ id: 'D' }],
      D: [],
    });

    await expect(detectCycle(['A'], getNeighbors)).resolves.toBeNull();
  });

  it('returns null when the cycle is not reachable from the given roots', async () => {
    const getNeighbors = graphOf({
      A: [{ id: 'B' }],
      B: [],
      X: [{ id: 'Y' }],
      Y: [{ id: 'X' }],
    });

    await expect(detectCycle(['A'], getNeighbors)).resolves.toBeNull();
  });
});
