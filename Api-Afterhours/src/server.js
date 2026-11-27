require('dotenv').config();
const express = require('express');
const db = require('./config/db'); 
const authRoutes = require('./routes/auth.route');
const categoryRoutes = require('./routes/category.route'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Afterhours API is running',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});