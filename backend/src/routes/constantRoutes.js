"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const constantController_1 = require("../controllers/constantController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Only ADMIN and FINANCE should manage settings, but GET can be public or allowed for all
router.get('/', constantController_1.getConstants);
// Protected routes
router.use((0, authMiddleware_1.authMiddleware)(['ADMIN', 'FINANCE']));
router.post('/', constantController_1.createConstant);
router.put('/:id', constantController_1.updateConstant);
router.delete('/:id', constantController_1.deleteConstant);
exports.default = router;
