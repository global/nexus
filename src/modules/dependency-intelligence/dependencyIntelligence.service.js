const { bfs } = require('./bfs');
const { detectCycle } = require('./dfsCycleDetection');
const applicationService = require('../applications/application.service');
const applicationDependencyService = require('../application-dependencies/applicationDependency.service');
const physicalTechnologyComponentService = require('../physical-technology-components/physicalTechnologyComponent.service');
const technologyDependencyService = require('../technology-dependencies/technologyDependency.service');

/**
 * apm:ApplicationDependency edges out of a given Application. This is
 * used by `getApplicationBlastRadius()` to traverse the dependency graph
 * and find all downstream applications.
 */
const applicationEdges = async (applicationId) => {
  const dependencies = await applicationDependencyService.findAll({ upstreamApplication: applicationId });
  return dependencies.map((dependency) => ({
    id: dependency.downstreamApplication.toString(),
    dependencyId: dependency._id.toString(),
    usesProtocol: dependency.usesProtocol,
    hasSynchronicity: dependency.hasSynchronicity,
  }));
};

/**
 * apm:TechnologyDependency edges out of a given PhysicalTechnologyComponent.
 * This is used by `getTechnologyBlastRadius()` to traverse the dependency graph
 * and find all downstream technology components.
 */
const technologyEdges = async (componentId) => {
  const dependencies = await technologyDependencyService.findAll({ upstreamTechnologyComponent: componentId });
  return dependencies.map((dependency) => ({
    id: dependency.downstreamTechnologyComponent.toString(),
    dependencyId: dependency._id.toString(),
    usesProtocol: dependency.usesProtocol,
    hasSynchronicity: dependency.hasSynchronicity,
  }));
};

/**
 * Blast radius of a given Application over the apm:ApplicationDependency
 * graph: every Application transitively downstream of it, with the hop
 * count of the shortest dependency path to each (CQ-2), and whether the
 * traversed subgraph contains a circular dependency.
 *
 * @param {string} applicationId
 * @param {{ maxDepth?: number }} [options]
 */
const getApplicationBlastRadius = async (applicationId, options = {}) => {
  await applicationService.findById(applicationId);

  const reachable = await bfs(applicationId, applicationEdges, options);
  const cycle = await detectCycle([applicationId, ...reachable.map((r) => r.id)], applicationEdges);

  return {
    startId: applicationId,
    maxDepth: options.maxDepth ?? null,
    reachable,
    hasCycle: Boolean(cycle),
    cycle,
  };
};

/**
 * Blast radius of a given PhysicalTechnologyComponent over the
 * apm:TechnologyDependency graph — every PhysicalTechnologyComponent transitively downstream of it,
 *
 * @param {string} componentId
 * @param {{ maxDepth?: number }} [options]
 */
const getTechnologyBlastRadius = async (componentId, options = {}) => {
  await physicalTechnologyComponentService.findById(componentId);

  const reachable = await bfs(componentId, technologyEdges, options);
  const cycle = await detectCycle([componentId, ...reachable.map((r) => r.id)], technologyEdges);

  return {
    startId: componentId,
    maxDepth: options.maxDepth ?? null,
    reachable,
    hasCycle: Boolean(cycle),
    cycle,
  };
};

module.exports = { getApplicationBlastRadius, getTechnologyBlastRadius };
