const express = require('express');
const router = express.Router();
const productController = require('../controllers/produk.controller');

// Memanggil middleware
const { verifyToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

// Public (Siapa saja bisa lihat produk)
router.get('/', productController.getAllProducts);

// Private Admin (Gunakan upload.single('image') untuk menangkap 1 file gambar)
router.post('/', verifyToken, isAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;