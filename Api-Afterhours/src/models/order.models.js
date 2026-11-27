const db = require('../config/db');

const OrderModel = {
  // Membuat pesanan baru dengan transaksi (semua berhasil atau semua batal)
  createOrder: async (userId, totalPrice, items) => {
    const connection = await db.getConnection(); // Ambil koneksi khusus untuk transaksi
    
    try {
      await connection.beginTransaction();

      // 1. Simpan ke tabel orders
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)',
        [userId, totalPrice, 'pending']
      );
      const orderId = orderResult.insertId;

      // 2. Simpan ke tabel order_items
      for (let item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_time, subtotal) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price, item.subtotal]
        );
      }

      await connection.commit();
      return orderId;

    } catch (error) {
      await connection.rollback(); // Batalkan semua jika ada error
      throw error;
    } finally {
      connection.release(); // Kembalikan koneksi ke pool
    }
  },

  // Ambil riwayat pesanan milik customer tertentu
  getByUserId: async (userId) => {
    const query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await db.query(query, [userId]);
    return rows;
  },

  // Ambil detail pesanan (beserta item-itemnya)
  getOrderDetails: async (orderId) => {
    // Ambil data order
    const [orderRows] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orderRows.length === 0) return null;

    // Ambil data item yang dibeli
    const queryItems = `
      SELECT oi.*, p.name AS product_name, p.image AS product_image 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
    const [itemRows] = await db.query(queryItems, [orderId]);

    return {
      ...orderRows[0],
      items: itemRows
    };
  },

  // Admin: Ambil semua pesanan
  getAllOrders: async () => {
    const query = `
      SELECT o.*, u.name AS customer_name 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  updateStatus: async (orderId, status) => {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  }
};

module.exports = OrderModel;