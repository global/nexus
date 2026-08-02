const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');

router.get('/me', authenticate, controller.me);

module.exports = router;
