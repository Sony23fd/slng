"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || 'supersecretkey';
const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, SECRET);
            // Assign to req (assuming custom typings or just any for prototype)
            req.user = decoded;
            console.log('authMiddleware check:', { requiredRoles: roles, userRole: decoded.role });
            if (roles.length > 0 && !roles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Access denied' });
            }
            next();
        }
        catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
};
exports.authMiddleware = authMiddleware;
