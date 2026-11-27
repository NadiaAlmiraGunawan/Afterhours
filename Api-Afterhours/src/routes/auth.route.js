const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Menyesuaikan dengan nama file middleware milikmu (pakai titik)
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Endpoint cek profil
router.get('/me', verifyToken, authController.getMe);

module.exports = router;