"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Only ADMIN and FINANCE can view stats maybe? Let's allow any authenticated for now since it's dashboard
router.use((0, authMiddleware_1.authMiddleware)(['ADMIN', 'FINANCE', 'SALES']));
router.get('/stats', adminController_1.getDashboardStats);
exports.default = router;
