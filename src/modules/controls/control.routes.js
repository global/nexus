const express = require('express');
const router = express.Router();
const controller = require('./control.controller');
const { authenticate, authorize } = require('../../middleware/auth');

const canRead = authorize('admin', 'portfolio-manager', 'viewer');
const canWrite = authorize('admin', 'portfolio-manager');
const canDelete = authorize('admin');

router.use(authenticate);

router.get('/', canRead, controller.getAll);
router.get('/:id', canRead, controller.getOne);
router.post('/', canWrite, controller.create);
router.put('/:id', canWrite, controller.update);
router.delete('/:id', canDelete, controller.remove);

module.exports = router;
