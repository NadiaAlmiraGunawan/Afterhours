const multer = require('multer');
const path = require('path');

// 1. Atur tempat penyimpanan dan nama file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder tempat menyimpan gambar
  },
  filename: function (req, file, cb) {
    // Buat nama file unik: produk-171234567.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // Ambil ekstensi (.jpg, .png)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 2. Filter hanya file gambar
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diizinkan!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Maksimal 5 MB
});

module.exports = upload;