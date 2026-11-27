const db = require('../config/db');

const OrderModel = {
  createOrder: async (userId, totalPrice, items) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)',
        [userId, totalPrice, 'pending']
      );
      const orderId = orderResult.insertId;

      for (let item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_time, subtotal) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price, item.subtotal]
        );
      }

      await connection.commit();
      return orderId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  getByUserId: async (userId) => {
    const query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await db.query(query, [userId]);
    return rows;
  },

  getOrderDetails: async (orderId) => {
    const [orderRows] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orderRows.length === 0) return null;

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
  },

  createPaymentRecord: async (data) => {
    const { order_id, midtrans_order_id, amount, transaction_status } = data;
    const query = `
      INSERT INTO payments (order_id, midtrans_order_id, amount, transaction_status) 
      VALUES (?, ?, ?, ?)
    `;
    await db.query(query, [order_id, midtrans_order_id, amount, transaction_status]);
  }
};

module.exports = OrderModel;