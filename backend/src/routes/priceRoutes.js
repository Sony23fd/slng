"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const priceController_1 = require("../controllers/priceController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// GET prices is accessible to any logged-in user
router.get('/', (0, authMiddleware_1.authMiddleware)(), priceController_1.getPrices);
// Only ADMIN and FINANCE can create or update prices
router.post('/', (0, authMiddleware_1.authMiddleware)(['ADMIN', 'FINANCE']), priceController_1.createPrice);
router.put('/:id', (0, authMiddleware_1.authMiddleware)(['ADMIN', 'FINANCE']), priceController_1.updatePrice);
exports.default = router;
