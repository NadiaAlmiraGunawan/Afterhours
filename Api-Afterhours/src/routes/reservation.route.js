const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// Rute Customer
router.post('/', verifyToken, reservationController.createReservation);
router.get('/my-reservations', verifyToken, reservationController.getMyReservations);

// Rute Admin
router.get('/', verifyToken, isAdmin, reservationController.getAllReservations);
router.put('/:id/status', verifyToken, isAdmin, reservationController.updateStatus);

module.exports = router;