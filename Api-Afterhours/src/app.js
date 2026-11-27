const express = require('express');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/auth.route');
const categoryRoutes = require('./routes/category.route');
const productRoutes = require('./routes/produk.route');

const app = express();

// Middleware Global
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder Static (untuk akses gambar)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Daftarkan Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Endpoint Root (Health Check)
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Afterhours API is running' });
});

// Ekspor app agar bisa dipakai oleh server.js
module.exports = app;