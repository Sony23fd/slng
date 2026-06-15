"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../db"));
const SECRET = process.env.JWT_SECRET || 'supersecretkey';
const login = async (req, res) => {
    const { name, password } = req.body;
    try {
        const user = await db_1.default.user.findFirst({ where: { name } });
        if (!user) {
            return res.status(401).json({ error: 'Нэр эсвэл нууц үг буруу байна' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Нэр эсвэл нууц үг буруу байна' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, name: user.name }, SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, stamp_url: user.stamp_url } });
    }
    catch (error) {
        res.status(500).json({ error: 'Серверийн алдаа гарлаа' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = await db_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({ id: user.id, name: user.name, role: user.role, stamp_url: user.stamp_url });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { stamp_url } = req.body;
        const user = await db_1.default.user.update({
            where: { id: req.user.id },
            data: { stamp_url }
        });
        res.json({ id: user.id, name: user.name, role: user.role, stamp_url: user.stamp_url });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateProfile = updateProfile;
