const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

router.post("/register", register);
router.post("/login", login);

router.get("/me", auth, (req, res) => {
  res.json({ success: true, message: "Token valid", data: req.user });
});

router.get("/admin", auth, authorize("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Selamat datang, admin!",
    data: req.user,
  });
});

module.exports = router;
