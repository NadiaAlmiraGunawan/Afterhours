const OrderModel = require('../models/order.models');
const db = require('../config/db');
const snap = require('../config/midtrans');
const crypto = require('crypto');

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body; 

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Keranjang belanja kosong' });
    }

    let totalPrice = 0;
    const validatedItems = [];

    for (let item of items) {
      const [productRows] = await db.query('SELECT price, stock FROM products WHERE id = ?', [item.product_id]);
      
      if (productRows.length === 0) {
        return res.status(404).json({ success: false, message: `Produk dengan ID ${item.product_id} tidak ditemukan` });
      }

      const product = productRows[0];
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Stok produk ID ${item.product_id} tidak mencukupi` });
      }

      const subtotal = product.price * item.quantity;
      totalPrice += subtotal;

      validatedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price, 
        subtotal: subtotal
      });
    }

    const orderId = await OrderModel.createOrder(userId, totalPrice, validatedItems);

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: { order_id: orderId, total_price: totalPrice, status: 'pending' }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getByUserId(req.user.id);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.getOrderDetails(id);

    if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });

    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await OrderModel.updateStatus(id, status);
    res.status(200).json({ success: true, message: `Status pesanan diubah menjadi ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.getOrderDetails(id);

    if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    if (order.status !== 'pending') return res.status(400).json({ success: false, message: 'Pesanan sudah dibayar atau diproses' });

    const midtransOrderId = `ORDER-${order.id}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: parseInt(order.total_price)
      },
      customer_details: {
        first_name: req.user.name || 'Customer',
        email: req.user.email || 'customer@example.com'
      }
    };

    const transaction = await snap.createTransaction(parameter);

    await OrderModel.createPaymentRecord({
      order_id: order.id,
      midtrans_order_id: midtransOrderId,
      amount: order.total_price,
      transaction_status: 'pending'
    });

    res.status(200).json({
      success: true,
      message: 'Token pembayaran berhasil dibuat',
      data: { snap_token: transaction.token, redirect_url: transaction.redirect_url }
    });

  } catch (error) {
    console.error('Midtrans Error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat transaksi pembayaran' });
  }
};

exports.midtransWebhook = async (req, res) => {
  try {
    const notification = req.body;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    const signatureKey = crypto
      .createHash('sha512')
      .update(`${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`)
      .digest('hex');

    if (signatureKey !== notification.signature_key) {
      return res.status(403).json({ success: false, message: 'Signature tidak valid' });
    }

    const [payments] = await db.query('SELECT * FROM payments WHERE midtrans_order_id = ?', [notification.order_id]);
    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan' });
    }

    const payment = payments[0];
    const transactionStatus = notification.transaction_status;

    await db.query(
      'UPDATE payments SET transaction_status = ?, payment_method = ?, transaction_id = ?, payment_time = NOW() WHERE id = ?',
      [transactionStatus, notification.payment_type, notification.transaction_id, payment.id]
    );

    let newOrderStatus = 'pending';
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      newOrderStatus = 'processing';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      newOrderStatus = 'cancelled';
    }

    await OrderModel.updateStatus(payment.order_id, newOrderStatus);

    res.status(200).json({ success: true, message: 'Webhook berhasil diproses' });

  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada webhook' });
  }
};