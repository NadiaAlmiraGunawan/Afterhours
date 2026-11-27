const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

router.get('/', auth, getAll);
router.get('/:id', auth, getById);

router.post('/', auth, authorize('admin'), create);
router.put('/:id', auth, authorize('admin'), update);
router.delete('/:id', auth, authorize('admin'), remove);

module.exports = router;