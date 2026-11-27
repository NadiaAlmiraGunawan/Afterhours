const db = require('../config/db');

const ReservationModel = {
  getAll: async () => {
    const query = `
      SELECT r.*, u.name AS customer_name, t.table_number 
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN \`tables\` t ON r.table_id = t.id
      ORDER BY r.reservation_date DESC, r.start_time DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  getByUserId: async (userId) => {
    const query = `
      SELECT r.*, t.table_number 
      FROM reservations r
      JOIN \`tables\` t ON r.table_id = t.id
      WHERE r.user_id = ? 
      ORDER BY r.reservation_date DESC
    `;
    const [rows] = await db.query(query, [userId]);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM reservations WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { user_id, table_id, number_of_people, reservation_date, start_time, duration, notes } = data;
    const query = `
      INSERT INTO reservations (user_id, table_id, number_of_people, reservation_date, start_time, duration, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [user_id, table_id, number_of_people, reservation_date, start_time, duration, notes]);
    return result.insertId;
  },

  updateStatus: async (id, status) => {
    await db.query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
  },

  checkAvailability: async (table_id, date, start_time, duration) => {
    const [rows] = await db.query(
      `SELECT start_time, duration FROM reservations 
       WHERE table_id = ? AND reservation_date = ? AND status IN ('pending', 'confirmed')`,
      [table_id, date]
    );

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return (hours * 60) + minutes;
    };

    const newStart = timeToMinutes(start_time);
    const newEnd = newStart + Number(duration);

    for (let row of rows) {
      const existingStart = timeToMinutes(row.start_time);
      const existingEnd = existingStart + Number(row.duration);

      if (newStart < existingEnd && newEnd > existingStart) {
        return false; 
      }
    }
    return true; 
  }
};

module.exports = ReservationModel;