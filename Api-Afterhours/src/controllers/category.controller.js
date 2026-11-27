const db = require("../config/db");

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY id ASC");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("getAll categories error:", err);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Kategori tidak ditemukan" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getById category error:", err);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

const create = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Nama kategori wajib diisi" });
    }

    const [existing] = await db.query(
      "SELECT id FROM categories WHERE name = ?",
      [name],
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Nama kategori sudah ada" });
    }

    const [result] = await db.query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name, description || null],
    );

    res.status(201).json({
      success: true,
      message: "Kategori berhasil dibuat",
      data: { id: result.insertId, name, description: description || null },
    });
  } catch (err) {
    console.error("create category error:", err);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const [existing] = await db.query(
      "SELECT id FROM categories WHERE id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Kategori tidak ditemukan" });
    }

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Nama kategori wajib diisi" });
    }

    const [duplicate] = await db.query(
      "SELECT id FROM categories WHERE name = ? AND id != ?",
      [name, id],
    );
    if (duplicate.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Nama kategori sudah dipakai" });
    }

    await db.query(
      "UPDATE categories SET name = ?, description = ? WHERE id = ?",
      [name, description || null, id],
    );

    res.json({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: { id: Number(id), name, description: description || null },
    });
  } catch (err) {
    console.error("update category error:", err);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      "SELECT id FROM categories WHERE id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Kategori tidak ditemukan" });
    }

    const [usedBy] = await db.query(
      "SELECT id FROM products WHERE category_id = ? LIMIT 1",
      [id],
    );
    if (usedBy.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Kategori tidak bisa dihapus karena masih dipakai produk",
      });
    }

    await db.query("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (err) {
    console.error("delete category error:", err);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

module.exports = { getAll, getById, create, update, remove };
