const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/users.models");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Nama, email, dan password wajib diisi",
        });
    }

    if (password.length < 4) {
      return res
        .status(400)
        .json({ success: false, message: "Password minimal 4 karakter" });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email sudah terdaftar" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUserId = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: "customer",
    });

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: { id: newUserId, name, email, role: "customer" },
    });
  } catch (error) {
    console.error("Error saat register:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email dan password wajib diisi" });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah" });
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error saat login:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      message: "Data user berhasil diambil",
      data: user,
    });
  } catch (error) {
    console.error("Error getMe:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server" });
  }
};
