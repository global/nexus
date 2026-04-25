const express = require('express');
const router = express.Router();

const registryRoutes = require('../modules/registry/registry.routes');

router.get('/', (_req, res) => res.json({ message: 'Welcome to Nexus Insight API' }));

router.use('/api/registry', registryRoutes);

module.exports = router;
