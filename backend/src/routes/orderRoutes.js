"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protect all order routes
router.use((0, authMiddleware_1.authMiddleware)());
router.get('/my', orderController_1.getMyOrders);
router.get('/:id', orderController_1.getOrderById);
router.post('/', orderController_1.createOrder);
router.put('/:id', orderController_1.updateOrder);
router.put('/:id/status', orderController_1.updateOrderStatus);
exports.default = router;
