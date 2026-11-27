const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");

router.post("/", verifyToken, orderController.createOrder);
router.get("/my-orders", verifyToken, orderController.getMyOrders);
router.get("/:id", verifyToken, orderController.getOrderDetail);
router.post("/:id/pay", verifyToken, orderController.createPayment);
router.post("/webhook", orderController.midtransWebhook);
router.get("/", verifyToken, isAdmin, orderController.getAllOrders);
router.put("/:id/status", verifyToken, isAdmin, orderController.updateStatus);

module.exports = router;
