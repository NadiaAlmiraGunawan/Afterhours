const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orders.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// Rute Customer
router.post('/', verifyToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.get('/:id', verifyToken, orderController.getOrderDetail); // Bisa diakses admin & customer pemilik

// Rute Admin
router.get('/', verifyToken, isAdmin, orderController.getAllOrders);
router.put('/:id/status', verifyToken, isAdmin, orderController.updateStatus);

module.exports = router;