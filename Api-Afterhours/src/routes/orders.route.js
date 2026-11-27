const express = require('express');
const router = express.Router();
const {
  create,
  getAll,
  getMyOrders,
  getById,
  updateStatus
} = require('../controllers/orders.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

// Customer buat pesanan
router.post('/', auth, create);

// Customer lihat pesanan sendiri
router.get('/my', auth, getMyOrders);

// Admin lihat semua pesanan
router.get('/', auth, authorize('admin'), getAll);

// Detail (admin atau pemilik)
router.get('/:id', auth, getById);

// Admin ubah status
router.put('/:id/status', auth, authorize('admin'), updateStatus);

module.exports = router;