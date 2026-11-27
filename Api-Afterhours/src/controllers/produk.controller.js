const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const getAll = async (req, res) => {
  try {
    const { category_id } = req.query;

    let sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `;
    const params = [];

    if (category_id) {
      sql += ' WHERE p.category_id = ?';
      params.push(category_id);
    }

    sql += ' ORDER BY p.id ASC';

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getAll products error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getById product error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const create = async (req, res) => {
  try {
    const { category_id, name, description, price, is_available } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'category_id, name, dan price wajib diisi'
      });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ success: false, message: 'Harga tidak valid' });
    }

    const [cat] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (cat.length === 0) {
      return res.status(400).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const [result] = await db.query(
      `INSERT INTO products (category_id, name, description, price, image, is_available)
       VALUES (?, ?, ?, ?, NULL, ?)`,
      [
        category_id,
        name,
        description || null,
        priceNum,
        is_available === undefined ? 1 : (is_available ? 1 : 0)
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Produk berhasil dibuat',
      data: {
        id: result.insertId,
        category_id: Number(category_id),
        name,
        description: description || null,
        price: priceNum,
        image: null,
        is_available: is_available === undefined ? 1 : (is_available ? 1 : 0)
      }
    });
  } catch (err) {
    console.error('create product error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, is_available } = req.body;

    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'category_id, name, dan price wajib diisi'
      });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ success: false, message: 'Harga tidak valid' });
    }

    const [cat] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (cat.length === 0) {
      return res.status(400).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const available = is_available === undefined
      ? existing[0].is_available
      : (is_available ? 1 : 0);

    await db.query(
      `UPDATE products
       SET category_id = ?, name = ?, description = ?, price = ?, is_available = ?
       WHERE id = ?`,
      [category_id, name, description || null, priceNum, available, id]
    );

    res.json({
      success: true,
      message: 'Produk berhasil diperbarui',
      data: {
        id: Number(id),
        category_id: Number(category_id),
        name,
        description: description || null,
        price: priceNum,
        image: existing[0].image,
        is_available: available
      }
    });
  } catch (err) {
    console.error('update product error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const [used] = await db.query('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [id]);
    if (used.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Produk tidak bisa dihapus karena sudah ada di pesanan'
      });
    }

    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    console.error('delete product error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const uploadImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File gambar wajib diunggah' });
    }

    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    if (existing[0].image) {
      const oldPath = path.join(__dirname, '../../uploads', existing[0].image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const imageName = req.file.filename;
    await db.query('UPDATE products SET image = ? WHERE id = ?', [imageName, id]);

    res.json({
      success: true,
      message: 'Gambar berhasil diunggah',
      data: { id: Number(id), image: imageName, url: `/uploads/${imageName}` }
    });
  } catch (err) {
    console.error('uploadImage error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    if (!existing[0].image) {
      return res.status(400).json({ success: false, message: 'Produk tidak punya gambar' });
    }

    const filePath = path.join(__dirname, '../../uploads', existing[0].image);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query('UPDATE products SET image = NULL WHERE id = ?', [id]);
    res.json({ success: true, message: 'Gambar berhasil dihapus' });
  } catch (err) {
    console.error('deleteImage error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

module.exports = { getAll, getById, create, update, remove, uploadImage, deleteImage };