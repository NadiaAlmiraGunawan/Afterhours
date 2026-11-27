const express = require("express");
const path = require("path");

const authRoutes = require("./routes/auth.route");
const categoryRoutes = require("./routes/category.route");
const productRoutes = require("./routes/produk.route");
const tableRoutes = require("./routes/table.route");
const reservationRoutes = require("./routes/reservation.route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reservations", reservationRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Afterhours API is running" });
});

module.exports = app;
