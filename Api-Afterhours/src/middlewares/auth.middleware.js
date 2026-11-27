const { verifyToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan, silakan login'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah kedaluwarsa, silakan login ulang'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }
};

module.exports = auth;