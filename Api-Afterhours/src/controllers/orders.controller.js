const OrderModel = require('../models/order.models');
const db = require('../config/db');

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body; // Format dari frontend: [{ product_id: 1, quantity: 2 }, ...]

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Keranjang belanja kosong' });
    }

    let totalPrice = 0;
    const validatedItems = [];

    // 1. Validasi setiap produk dan hitung total HARGA ASLI dari database
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
        price: product.price, // Gunakan harga dari DB, bukan dari frontend
        subtotal: subtotal
      });
    }

    // 2. Simpan pesanan menggunakan model (Transaction)
    const orderId = await OrderModel.createOrder(userId, totalPrice, validatedItems);

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: {
        order_id: orderId,
        total_price: totalPrice,
        status: 'pending'
      }
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

    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    // Keamanan: Pastikan customer hanya bisa melihat pesanannya sendiri
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