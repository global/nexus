const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');

router.get('/', (_req, res) => res.json({ message: 'Welcome to Nexus Insight API' }));

router.use('/api/auth', authRoutes);

module.exports = router;
