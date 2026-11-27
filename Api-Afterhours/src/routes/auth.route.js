const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// TAMBAHKAN BARIS IMPORT INI:
const { verifyToken } = require('../middlewares/auth.middleware');

// Endpoint public
router.post('/register', authController.register);
router.post('/login', authController.login);

// Endpoint private (butuh login)
router.get('/me', verifyToken, authController.getMe);

module.exports = router;