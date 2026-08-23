/**
 * Depth-First-Search-based directed-cycle detection, using the standard
 * three-colour scheme [1]: white = undiscovered, gray = on the
 * current recursion stack, black = fully explored. 
 * A cycle exists if and only if DFS ever follows an edge
 * into a gray node — a "back edge" to an ancestor, the textbook
 * signature of a cycle in a directed graph.
 *
 * Used by the Dependency Intelligence Engine (O4) to flag circular
 * dependencies (e.g. two applications mutually depending on each other)
 * before a caller relies on the dependency graph being acyclic — real
 * portfolios are not guaranteed to be free of these, whether by design
 * (a synchronous bidirectional integration) or by accumulated technical
 * debt.
 *
 * [1] T. H. Cormen, C. E. Leiserson, R. L. Rivest, and C. Stein,
 *     Introduction to Algorithms, 4th ed. Cambridge, MA, USA: MIT Press, 2022.
 */

const WHITE = 0;
const GRAY = 1;
const BLACK = 2;

/**
 * @param {string[]} nodeIds 
 *  - array of node ids to check for cycles
 * @param {(nodeId: string) => Promise<Array<{ id: string, [key: string]: any }>>} getNeighbors
  * - an async function returning the neighbors of a given node id
 * @returns {Promise<string[] | null>} 
 *  - an array of node ids forming a cycle, or null if no cycle exists
 */
async function detectCycle(nodeIds, getNeighbors) {
  const color = new Map();

  async function visit(nodeId, stack) {
    color.set(nodeId, GRAY);
    stack.push(nodeId);

    const neighbors = await getNeighbors(nodeId);
    for (const { id: neighborId } of neighbors) {
      const neighborColor = color.get(neighborId) ?? WHITE;

      if (neighborColor === GRAY) {
        const cycleStart = stack.indexOf(neighborId);
        return [...stack.slice(cycleStart), neighborId];
      }

      if (neighborColor === WHITE) {
        const cycle = await visit(neighborId, stack);
        if (cycle) return cycle;
      }
    }

    stack.pop();
    color.set(nodeId, BLACK);
    return null;
  }

  for (const nodeId of nodeIds) {
    if ((color.get(nodeId) ?? WHITE) === WHITE) {
      const cycle = await visit(nodeId, []);
      if (cycle) return cycle;
    }
  }

  return null;
}

module.exports = { detectCycle };
