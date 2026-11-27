const ProductModel = require('../models/product.models');
const fs = require('fs'); // Untuk menghapus file gambar lama
const path = require('path');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.getAll();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { category_id, name, description, price, stock } = req.body;
    
    // Validasi input
    if (!category_id || !name || !price) {
      // Hapus gambar yang sudah terlanjur di-upload jika validasi gagal
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Kategori, nama, dan harga wajib diisi' });
    }

    // Ambil nama file gambar dari Multer (jika ada)
    const image = req.file ? req.file.filename : null;

    const newId = await ProductModel.create({
      category_id, name, description, price, stock, image
    });

    res.status(201).json({ 
      success: true, 
      message: 'Produk berhasil ditambahkan',
      data: { id: newId, name, image }
    });
  } catch (error) {
    console.error(error);
    if (req.file) fs.unlinkSync(req.file.path); // Hapus file jika DB error
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, stock } = req.body;
    
    const existingProduct = await ProductModel.getById(id);
    if (!existingProduct) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const image = req.file ? req.file.filename : null;

    // Jika ada gambar baru, hapus gambar lama dari folder uploads
    if (image && existingProduct.image) {
      const oldPath = path.join(__dirname, '../../uploads', existingProduct.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await ProductModel.update(id, {
      category_id, name, description, price, stock, image
    });

    res.status(200).json({ success: true, message: 'Produk berhasil diupdate' });
  } catch (error) {
    console.error(error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.getById(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    // Hapus file gambar dari folder uploads
    if (product.image) {
      const imgPath = path.join(__dirname, '../../uploads', product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await ProductModel.delete(id);
    res.status(200).json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};