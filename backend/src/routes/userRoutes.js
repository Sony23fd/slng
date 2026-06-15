"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Only ADMIN can manage users
router.use((0, authMiddleware_1.authMiddleware)(['ADMIN']));
router.get('/', userController_1.getUsers);
router.post('/', userController_1.createUser);
router.delete('/:id', userController_1.deleteUser);
exports.default = router;
