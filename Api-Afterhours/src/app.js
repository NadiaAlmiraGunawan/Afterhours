const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.route');
const categoryRoutes = require('./routes/category.route');
const productRoutes = require('./routes/produk.route');
const orderRoutes = require('./routes/orders.route');
const bookingRoutes = require('./routes/booking.route');

const app = express();

// ==============================
// 1. Middleware Global
// ==============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve folder uploads agar gambar bisa diakses via URL
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==============================
// 2. Routes
// ==============================
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Afterhours API berjalan' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);

// ==============================
// 3. 404 Handler (Endpoint tidak ada)
// ==============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`
  });
});

// ==============================
// 4. Global Error Handler
// ==============================
app.use((err, req, res, next) => {
  console.error('Global Error:', err.message);

  // Error dari Multer (upload file)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran file terlalu besar. Maksimal 2MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  // Error kustom dari fileFilter (bukan gambar)
  if (err.message && err.message.includes('Hanya file gambar')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Error database MySQL (constraint FK)
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      success: false,
      message: 'Data tidak bisa dihapus karena masih digunakan di tabel lain'
    });
  }

  // Error syntax JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Format JSON tidak valid'
    });
  }

  // Error default
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = app;