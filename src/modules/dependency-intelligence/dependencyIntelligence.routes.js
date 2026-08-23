const express = require('express');
const router = express.Router();
const controller = require('./dependencyIntelligence.controller');
const { authenticate, authorize } = require('../../middleware/auth');

const canRead = authorize('admin', 'portfolio-manager', 'viewer');

router.use(authenticate);

router.get('/applications/:id/blast-radius', canRead, controller.getApplicationBlastRadius);
router.get('/technology-components/:id/blast-radius', canRead, controller.getTechnologyBlastRadius);

module.exports = router;
