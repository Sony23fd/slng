"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const db_1 = __importDefault(require("../db"));
const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await db_1.default.order.count();
        // Calculate total revenue
        const orders = await db_1.default.order.findMany({
            select: { final_price: true }
        });
        const totalRevenue = orders.reduce((sum, order) => sum + (order.final_price || 0), 0);
        // Pending jobs (status not 'Бэлэн болсон' or 'Хүлээлгэж өгсөн')
        const pendingJobs = await db_1.default.order.count({
            where: {
                current_status: {
                    notIn: ['Бэлэн болсон', 'Хүлээлгэж өгсөн']
                }
            }
        });
        res.json({
            totalOrders,
            totalRevenue,
            pendingJobs
        });
    }
    catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
