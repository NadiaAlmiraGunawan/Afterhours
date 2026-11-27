const express = require('express');
const router = express.Router();
const {
  create,
  getAll,
  getMyBookings,
  getById,
  updateStatus,
  remove
} = require('../controllers/booking.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

// Customer buat booking
router.post('/', auth, create);

// Customer lihat booking sendiri
router.get('/my', auth, getMyBookings);

// Admin lihat semua booking
router.get('/', auth, authorize('admin'), getAll);

// Detail booking (admin atau pemilik)
router.get('/:id', auth, getById);

// Admin ubah status
router.put('/:id/status', auth, authorize('admin'), updateStatus);

// Hapus booking (admin atau pemilik)
router.delete('/:id', auth, remove);

module.exports = router;