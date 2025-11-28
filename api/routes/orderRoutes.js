const express = require("express");
const router = express.Router();
const { getAllOrders, updateOrderStatus, createOrder, getOrdersByUser } = require("../controllers/orderController");
// const { adminOnly } = require("../middleware/auth"); // Uncomment when auth is ready

// For now, we might skip adminOnly if auth is not fully set up on frontend for admin
// But ideally it should be there.
// router.get("/", adminOnly, getAllOrders);
// router.put("/:id/status", adminOnly, updateOrderStatus);

router.get("/", getAllOrders);
router.post("/", createOrder);
router.get("/user/:userId", getOrdersByUser);
router.put("/:id/status", updateOrderStatus);

module.exports = router;
