const CategoryModel = require('../models/category.models');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.getAll();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
    }

    const newId = await CategoryModel.create(name);
    res.status(201).json({ 
      success: true, 
      message: 'Kategori berhasil ditambahkan',
      data: { id: newId, name }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
    }

    const category = await CategoryModel.getById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    await CategoryModel.update(id, name);
    res.status(200).json({ success: true, message: 'Kategori berhasil diupdate' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await CategoryModel.getById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    await CategoryModel.delete(id);
    res.status(200).json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ success: false, message: 'Kategori tidak bisa dihapus karena masih digunakan oleh produk' });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};