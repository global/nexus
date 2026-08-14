const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const applicationRoutes = require('../modules/applications/application.routes');
const actorRoutes = require('../modules/actors/actor.routes');
const organizationUnitRoutes = require('../modules/organization-units/organizationUnit.routes');
const businessCapabilityRoutes = require('../modules/business-capabilities/businessCapability.routes');
const supplierRoutes = require('../modules/suppliers/supplier.routes');
const controlRoutes = require('../modules/controls/control.routes');
const findingRoutes = require('../modules/findings/finding.routes');
const applicationDependencyRoutes = require('../modules/application-dependencies/applicationDependency.routes');
const costRecordRoutes = require('../modules/cost-records/costRecord.routes');
const performanceAssessmentRoutes = require('../modules/performance-assessments/performanceAssessment.routes');
const roleRoutes = require('../modules/roles/role.routes');
const applicationContactRoutes = require('../modules/application-contacts/applicationContact.routes');
const locationRoutes = require('../modules/locations/location.routes');
const documentRoutes = require('../modules/documents/document.routes');
const codeRepositoryRoutes = require('../modules/code-repositories/codeRepository.routes');
const businessFunctionRoutes = require('../modules/business-functions/businessFunction.routes');
const businessProcessRoutes = require('../modules/business-processes/businessProcess.routes');
const businessServiceRoutes = require('../modules/business-services/businessService.routes');
const technologyServiceRoutes = require('../modules/technology-services/technologyService.routes');

router.get('/', (_req, res) => res.json({ message: 'Welcome to Nexus Insight API' }));

router.use('/api/auth', authRoutes);
router.use('/api/applications', applicationRoutes);
router.use('/api/actors', actorRoutes);
router.use('/api/organization-units', organizationUnitRoutes);
router.use('/api/business-capabilities', businessCapabilityRoutes);
router.use('/api/suppliers', supplierRoutes);
router.use('/api/controls', controlRoutes);
router.use('/api/findings', findingRoutes);
router.use('/api/application-dependencies', applicationDependencyRoutes);
router.use('/api/cost-records', costRecordRoutes);
router.use('/api/performance-assessments', performanceAssessmentRoutes);
router.use('/api/roles', roleRoutes);
router.use('/api/application-contacts', applicationContactRoutes);
router.use('/api/locations', locationRoutes);
router.use('/api/documents', documentRoutes);
router.use('/api/code-repositories', codeRepositoryRoutes);
router.use('/api/business-functions', businessFunctionRoutes);
router.use('/api/business-processes', businessProcessRoutes);
router.use('/api/business-services', businessServiceRoutes);
router.use('/api/technology-services', technologyServiceRoutes);

module.exports = router;
