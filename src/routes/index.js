const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const applicationRoutes = require('../modules/applications/application.routes');

router.get('/', (_req, res) => res.json({ message: 'Welcome to Nexus Insight API' }));

router.use('/api/auth', authRoutes);
router.use('/api/applications', applicationRoutes);

module.exports = router;
