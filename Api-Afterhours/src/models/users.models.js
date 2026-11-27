const db = require("../config/db");

const UserModel = {
  findByEmail: async (email) => {
    const query = "SELECT * FROM users WHERE email = ?";
    const [rows] = await db.query(query, [email]);
    return rows[0];
  },

  findById: async (id) => {
    const query = "SELECT id, name, email, role FROM users WHERE id = ?";
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },

  create: async (userData) => {
    const { name, email, password, role } = userData;
    const query =
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(query, [
      name,
      email,
      password,
      role || "customer",
    ]);
    return result.insertId;
  },
};

module.exports = UserModel;
