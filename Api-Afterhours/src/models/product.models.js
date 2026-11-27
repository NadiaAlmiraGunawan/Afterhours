const db = require('../config/db');

const ProductModel = {
  getAll: async () => {
    // JOIN untuk mengambil nama kategori
    const query = `
      SELECT p.*, c.name AS category_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      ORDER BY p.id DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { category_id, name, description, price, stock, image } = data;
    const query = 'INSERT INTO products (category_id, name, description, price, stock, image) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [category_id, name, description, price, stock, image]);
    return result.insertId;
  },

  update: async (id, data) => {
    const { category_id, name, description, price, stock, image } = data;
    // Jika image baru di-upload, update image. Jika tidak, biarkan image lama.
    let query = 'UPDATE products SET category_id=?, name=?, description=?, price=?, stock=?';
    let params = [category_id, name, description, price, stock];

    if (image) {
      query += ', image=?';
      params.push(image);
    }
    
    query += ' WHERE id=?';
    params.push(id);

    await db.query(query, params);
  },

  delete: async (id) => {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
  }
};

module.exports = ProductModel;