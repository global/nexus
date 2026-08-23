/**
 * Breadth-First Search over an implicit directed graph — the Dependency
 * Intelligence Engine's (O4) core traversal algorithm, used to answer
 * "what does X affect, transitively?" reachability queries such as
 * CQ-1/CQ-2 — the standard algorithmic basis for graph reachability [1].
 *
 * The graph is never materialised in memory: `getNeighbors` is called
 * once per visited node and is expected to fetch that node's one-hop
 * out-edges from the backing service layer (e.g. ApplicationDependency
 * or TechnologyDependency), keeping this function decoupled from any
 * specific ontology class, Mongoose model, or persistence layer.
 *
 * [1] T. H. Cormen, C. E. Leiserson, R. L. Rivest, and C. Stein,
 *     Introduction to Algorithms, 4th ed. Cambridge, MA, USA: MIT Press, 2022.
 */

/**
 * @param {string} startId - the node id to start the BFS from
 * @param {(nodeId: string) => Promise<Array<{ id: string, [key: string]: any }>>} getNeighbors
 *  - an async function returning the neighbors of a given node id
 * @param {object} [options]
 * @param {number} [options.maxDepth=Infinity] - stop expanding beyond this many hops.
 * @returns {Promise<Array<{ id: string, hop: number, edge: object }>>}
 *  - an array of objects representing the reachable nodes, each with:
 *    - `id`: the node id of the reachable node
 *    - `hop`: the hop count from `startId` to this node
 *    - `edge`: the edge metadata of the edge that first discovered this node
 */
async function bfs(startId, getNeighbors, options = {}) {
  const maxDepth = options.maxDepth ?? Infinity;

  const visited = new Set([startId]);
  const result = [];
  let frontier = [startId];
  let hop = 0;

  while (frontier.length > 0 && hop < maxDepth) {
    hop += 1;
    const nextFrontier = [];

    for (const nodeId of frontier) {
      const neighbors = await getNeighbors(nodeId);
      for (const { id: neighborId, ...edge } of neighbors) {
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);
        result.push({ id: neighborId, hop, edge });
        nextFrontier.push(neighborId);
      }
    }

    frontier = nextFrontier;
  }

  return result;
}

module.exports = { bfs };
