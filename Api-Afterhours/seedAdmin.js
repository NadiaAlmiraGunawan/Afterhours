require('dotenv').config();
const bcrypt = require('bcrypt'); // atau 'bcryptjs' jika kamu pakai itu
const db = require('./src/config/db');

(async () => {
  try {
    const email = 'admin@afterhours.com';
    const password = 'admin123';
    
    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Cek apakah admin sudah ada
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('⚠️  Admin sudah ada:', email);
      process.exit(0);
    }

    // Buat admin baru
    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin Afterhours', email, hashed, 'admin']
    );
    
    console.log('✅ Admin berhasil dibuat!');
    console.log('Email   :', email);
    console.log('Password:', password);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal membuat admin:', err.message);
    process.exit(1);
  }
})();