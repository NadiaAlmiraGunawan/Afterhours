require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./src/config/db');

const createAdmin = async () => {
  try {
    const name = 'Admin Afterhours';
    const email = 'admin@gmail.com';
    const password = 'admin123';
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Admin sudah ada di database.');
      process.exit(0);
    }

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'admin']
    );
    
    console.log('Berhasil membuat akun admin!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Gagal membuat admin:', error);
    process.exit(1);
  }
};

createAdmin();