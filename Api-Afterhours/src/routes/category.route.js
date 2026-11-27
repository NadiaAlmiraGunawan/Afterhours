const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Memanggil middleware (sesuaikan dengan nama file kamu)
const { verifyToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// Endpoint Public (Siapa saja bisa lihat kategori)
router.get('/', categoryController.getAllCategories);

// Endpoint Private (HANYA Admin yang bisa tambah, edit, hapus)
router.post('/', verifyToken, isAdmin, categoryController.createCategory);
router.put('/:id', verifyToken, isAdmin, categoryController.updateCategory);
router.delete('/:id', verifyToken, isAdmin, categoryController.deleteCategory);

module.exports = router;