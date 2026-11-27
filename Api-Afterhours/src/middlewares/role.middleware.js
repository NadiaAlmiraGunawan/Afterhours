exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya admin yang diizinkan.",
    });
  }
};

exports.isCustomer = (req, res, next) => {
  if (req.user && req.user.role === "customer") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya customer yang diizinkan.",
    });
  }
};
