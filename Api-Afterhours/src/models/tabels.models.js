const db = require('../config/db');

const TableModel = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM `tables` ORDER BY table_number ASC');
    return rows;
  },
  
  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM `tables` WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { table_number, capacity } = data;
    const [result] = await db.query(
      'INSERT INTO `tables` (table_number, capacity) VALUES (?, ?)', 
      [table_number, capacity]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { table_number, capacity, status } = data;
    await db.query(
      'UPDATE `tables` SET table_number=?, capacity=?, status=? WHERE id=?',
      [table_number, capacity, status, id]
    );
  },

  delete: async (id) => {
    await db.query('DELETE FROM `tables` WHERE id = ?', [id]);
  }
};

module.exports = TableModel;    