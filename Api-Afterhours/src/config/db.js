const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_afterhours',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

// Tes koneksi database
db.query('SELECT 1')
  .then(() => {
    console.log('Berhasil terhubung ke database');
  })
  .catch((err) => {
    console.error('Gagal terhubung ke database:', err.message);
  });

module.exports = db;