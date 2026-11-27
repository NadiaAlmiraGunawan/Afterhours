const db = require('../config/db');

const create = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      customer_name,
      phone_number,
      booking_date,
      booking_time,
      number_of_people,
      table_number,
      notes
    } = req.body;

    if (!customer_name || !phone_number || !booking_date || !booking_time || !number_of_people || !table_number) {
      return res.status(400).json({
        success: false,
        message: 'customer_name, phone_number, booking_date, booking_time, number_of_people, dan table_number wajib diisi'
      });
    }

    const [existing] = await db.query(
      `SELECT id FROM bookings 
       WHERE table_number = ? 
         AND booking_date = ? 
         AND booking_time = ? 
         AND status IN ('pending', 'confirmed')`,
      [table_number, booking_date, booking_time]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Meja ${table_number} sudah dibooking pada tanggal ${booking_date} jam ${booking_time}`
      });
    }

    const [result] = await db.query(
      `INSERT INTO bookings 
       (user_id, customer_name, phone_number, booking_date, booking_time, number_of_people, table_number, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, customer_name, phone_number, booking_date, booking_time, number_of_people, table_number, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Booking berhasil dibuat',
      data: {
        id: result.insertId,
        user_id: userId,
        customer_name,
        phone_number,
        booking_date,
        booking_time,
        number_of_people,
        table_number,
        notes: notes || null,
        status: 'pending'
      }
    });
  } catch (err) {
    console.error('create booking error:', err);
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
      SELECT b.*, u.name AS user_name, u.email AS user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
    `;
    const params = [];

    if (status) {
      sql += ' WHERE b.status = ?';
      params.push(status);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM bookings b ${status ? 'WHERE b.status = ?' : ''}`,
      status ? [status] : []
    );
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limitNum);

    sql += ' ORDER BY b.booking_date DESC, b.booking_time DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [bookings] = await db.query(sql, params);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_items: totalItems,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('getAll bookings error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC, booking_time DESC',
      [userId]
    );

    res.json({ success: true, data: bookings });
  } catch (err) {
    console.error('getMyBookings error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await db.query(
      `SELECT b.*, u.name AS user_name, u.email AS user_email
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
    }

    const booking = bookings[0];

    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden, ini bukan booking Anda' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error('getById booking error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status harus salah satu dari: ${allowed.join(', ')}`
      });
    }

    const [existing] = await db.query('SELECT id FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
    }

    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    res.json({
      success: true,
      message: 'Status booking berhasil diperbarui',
      data: { id: Number(id), status }
    });
  } catch (err) {
    console.error('updateStatus booking error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id, user_id FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
    }

    if (req.user.role !== 'admin' && existing[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden, Anda tidak berhak menghapus booking ini' });
    }

    await db.query('DELETE FROM bookings WHERE id = ?', [id]);
    res.json({ success: true, message: 'Booking berhasil dihapus' });
  } catch (err) {
    console.error('delete booking error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

module.exports = { create, getAll, getMyBookings, getById, updateStatus, remove };