"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.createUser = exports.getUsers = void 0;
const db_1 = __importDefault(require("../db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getUsers = async (req, res) => {
    try {
        const users = await db_1.default.user.findMany({
            select: { id: true, name: true, role: true, createdAt: true }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    const { name, password, role } = req.body;
    try {
        const existing = await db_1.default.user.findFirst({ where: { name } });
        if (existing) {
            return res.status(400).json({ error: 'Хэрэглэгчийн нэр давхцаж байна' });
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.default.user.create({
            data: { name, password: hash, role }
        });
        res.json({ id: user.id, name: user.name, role: user.role });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
};
exports.createUser = createUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // If the user is tied to logs or orders, deleting might fail due to foreign key constraints,
        // so we should ideally check or just let Prisma throw and catch it.
        await db_1.default.user.delete({ where: { id: parseInt(id) } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user. User might be linked to existing orders.' });
    }
};
exports.deleteUser = deleteUser;
