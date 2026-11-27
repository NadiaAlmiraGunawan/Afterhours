const db = require('../config/db');

const create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      conn.release();
      return res.status(400).json({
        success: false,
        message: 'items wajib diisi dan berupa array'
      });
    }

    for (const item of items) {
      if (!item.product_id || !item.quantity || Number(item.quantity) < 1) {
        conn.release();
        return res.status(400).json({
          success: false,
          message: 'Setiap item wajib punya product_id dan quantity >= 1'
        });
      }
    }

    await conn.beginTransaction();

    const orderItemsData = [];
    let totalPrice = 0;

    for (const item of items) {
      const [rows] = await conn.query(
        'SELECT id, name, price, is_available FROM products WHERE id = ?',
        [item.product_id]
      );

      if (rows.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({
          success: false,
          message: `Produk id ${item.product_id} tidak ditemukan`
        });
      }

      const product = rows[0];
      if (!product.is_available) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          success: false,
          message: `Produk "${product.name}" sedang tidak tersedia`
        });
      }

      const qty = Number(item.quantity);
      const subtotal = Number(product.price) * qty;
      totalPrice += subtotal;

      orderItemsData.push({
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: qty
      });
    }

    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)',
      [userId, totalPrice, 'pending']
    );
    const orderId = orderResult.insertId;

    for (const item of orderItemsData) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    await conn.commit();
    conn.release();

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: {
        id: orderId,
        user_id: userId,
        total_price: totalPrice,
        status: 'pending',
        items: orderItemsData
      }
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('create order error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ success: false, message: 'Page dan limit harus angka positif' });
    }

    let sql = `
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    const params = [];

    if (status) {
      sql += ' WHERE o.status = ?';
      params.push(status);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM orders o ${status ? 'WHERE o.status = ?' : ''}`,
      status ? [status] : []
    );
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limitNum);

    sql += ' ORDER BY o.id DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [orders] = await db.query(sql, params);

    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name AS product_name, p.image AS product_image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({
      success: true,
      data: orders,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_items: totalItems,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('getAll orders error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ success: false, message: 'Page dan limit harus angka positif' });
    }

    let sql = 'SELECT * FROM orders WHERE user_id = ?';
    const params = [userId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM orders WHERE user_id = ? ${status ? 'AND status = ?' : ''}`,
      status ? [userId, status] : [userId]
    );
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limitNum);

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [orders] = await db.query(sql, params);

    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name AS product_name, p.image AS product_image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({
      success: true,
      data: orders,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_items: totalItems,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('getMyOrders error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    const order = orders[0];

    // Customer hanya boleh lihat pesanannya sendiri
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden, ini bukan pesanan Anda' });
    }

    const [items] = await db.query(
      `SELECT oi.*, p.name AS product_name, p.image AS product_image
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );
    order.items = items;

    res.json({ success: true, data: order });
  } catch (err) {
    console.error('getById order error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'processing', 'completed', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status harus salah satu dari: ${allowed.join(', ')}`
      });
    }

    const [existing] = await db.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    res.json({
      success: true,
      message: 'Status pesanan berhasil diperbarui',
      data: { id: Number(id), status }
    });
  } catch (err) {
    console.error('updateStatus order error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

module.exports = { create, getAll, getMyOrders, getById, updateStatus };