import { Request, Response } from 'express';
import prisma from '../db';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await prisma.order.count();
    
    // Calculate total revenue
    const orders = await prisma.order.findMany({
      select: { final_price: true }
    });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.final_price || 0), 0);

    // Pending jobs (status not 'Бэлэн болсон' or 'Хүлээлгэж өгсөн')
    const pendingJobs = await prisma.order.count({
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
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
