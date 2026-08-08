const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const applicationRoutes = require('../modules/applications/application.routes');
const actorRoutes = require('../modules/actors/actor.routes');
const organizationUnitRoutes = require('../modules/organization-units/organizationUnit.routes');

router.get('/', (_req, res) => res.json({ message: 'Welcome to Nexus Insight API' }));

router.use('/api/auth', authRoutes);
router.use('/api/applications', applicationRoutes);
router.use('/api/actors', actorRoutes);
router.use('/api/organization-units', organizationUnitRoutes);

module.exports = router;
