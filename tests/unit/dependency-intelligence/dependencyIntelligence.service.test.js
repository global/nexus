jest.mock('../../../src/modules/applications/application.service');
jest.mock('../../../src/modules/application-dependencies/applicationDependency.service');
jest.mock('../../../src/modules/physical-technology-components/physicalTechnologyComponent.service');
jest.mock('../../../src/modules/technology-dependencies/technologyDependency.service');

const applicationService = require('../../../src/modules/applications/application.service');
const applicationDependencyService = require('../../../src/modules/application-dependencies/applicationDependency.service');
const physicalTechnologyComponentService = require('../../../src/modules/physical-technology-components/physicalTechnologyComponent.service');
const technologyDependencyService = require('../../../src/modules/technology-dependencies/technologyDependency.service');
const service = require('../../../src/modules/dependency-intelligence/dependencyIntelligence.service');
const { NotFoundError } = require('../../../src/common/errors');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DependencyIntelligence Service', () => {
  describe('getApplicationBlastRadius', () => {
    it('throws NotFoundError when the start application does not exist', async () => {
      applicationService.findById.mockRejectedValue(new NotFoundError('Application not found'));
      await expect(service.getApplicationBlastRadius('nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('traverses the ApplicationDependency graph via BFS and reports no cycle for a straight chain', async () => {
      applicationService.findById.mockResolvedValue({ _id: 'A' });
      applicationDependencyService.findAll.mockImplementation(async ({ upstreamApplication }) => {
        const edges = {
          A: [{ _id: 'dep1', downstreamApplication: 'B', usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' }],
          B: [{ _id: 'dep2', downstreamApplication: 'C', usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' }],
          C: [],
        };
        return edges[upstreamApplication] ?? [];
      });

      const result = await service.getApplicationBlastRadius('A');

      expect(applicationService.findById).toHaveBeenCalledWith('A');
      expect(result.startId).toBe('A');
      expect(result.maxDepth).toBeNull();
      expect(result.reachable).toEqual([
        { id: 'B', hop: 1, edge: { dependencyId: 'dep1', usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' } },
        { id: 'C', hop: 2, edge: { dependencyId: 'dep2', usesProtocol: 'RESTAPI', hasSynchronicity: 'Synchronous' } },
      ]);
      expect(result.hasCycle).toBe(false);
      expect(result.cycle).toBeNull();
    });

    it('reports a cycle when two applications mutually depend on each other', async () => {
      applicationService.findById.mockResolvedValue({ _id: 'A' });
      applicationDependencyService.findAll.mockImplementation(async ({ upstreamApplication }) => {
        const edges = {
          A: [{ _id: 'dep1', downstreamApplication: 'B' }],
          B: [{ _id: 'dep2', downstreamApplication: 'A' }],
        };
        return edges[upstreamApplication] ?? [];
      });

      const result = await service.getApplicationBlastRadius('A');

      expect(result.hasCycle).toBe(true);
      expect(result.cycle).toEqual(['A', 'B', 'A']);
    });

    it('passes maxDepth through to the traversal and echoes it in the result', async () => {
      applicationService.findById.mockResolvedValue({ _id: 'A' });
      applicationDependencyService.findAll.mockImplementation(async ({ upstreamApplication }) => {
        const edges = {
          A: [{ _id: 'dep1', downstreamApplication: 'B' }],
          B: [{ _id: 'dep2', downstreamApplication: 'C' }],
        };
        return edges[upstreamApplication] ?? [];
      });

      const result = await service.getApplicationBlastRadius('A', { maxDepth: 1 });

      expect(result.maxDepth).toBe(1);
      expect(result.reachable.map((r) => r.id)).toEqual(['B']);
    });
  });

  describe('getTechnologyBlastRadius', () => {
    it('throws NotFoundError when the start component does not exist', async () => {
      physicalTechnologyComponentService.findById.mockRejectedValue(new NotFoundError('Physical technology component not found'));
      await expect(service.getTechnologyBlastRadius('nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('traverses the TechnologyDependency graph via BFS', async () => {
      physicalTechnologyComponentService.findById.mockResolvedValue({ _id: 'T1' });
      technologyDependencyService.findAll.mockImplementation(async ({ upstreamTechnologyComponent }) => {
        const edges = {
          T1: [{ _id: 'dep1', downstreamTechnologyComponent: 'T2' }],
          T2: [],
        };
        return edges[upstreamTechnologyComponent] ?? [];
      });

      const result = await service.getTechnologyBlastRadius('T1');

      expect(physicalTechnologyComponentService.findById).toHaveBeenCalledWith('T1');
      expect(result.reachable).toEqual([
        { id: 'T2', hop: 1, edge: { dependencyId: 'dep1', usesProtocol: undefined, hasSynchronicity: undefined } },
      ]);
      expect(result.hasCycle).toBe(false);
    });
  });
});
