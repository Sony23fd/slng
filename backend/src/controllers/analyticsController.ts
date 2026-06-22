import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. Total revenue this month
    const currentMonthOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      }
    });

    const totalRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.final_price || 0), 0);
    const totalOrders = currentMonthOrders.length;
    
    // Active orders (not Бэлэн or Олгосон)
    const activeOrdersCount = await prisma.order.count({
      where: {
        current_status: { notIn: ['Бэлэн', 'Олгосон'] }
      }
    });

    // 2. Sales by Category (Pie chart)
    const categoryStats = await prisma.order.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { final_price: true }
    });

    // 3. Sales Trend (Last 7 days Line chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        createdAt: true,
        final_price: true
      }
    });

    // Format trend data
    const trendMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      trendMap.set(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 0);
    }

    recentOrders.forEach(o => {
      const dateStr = o.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (trendMap.has(dateStr)) {
        trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + (o.final_price || 0));
      }
    });

    const trend = Array.from(trendMap.entries()).map(([date, revenue]) => ({ date, revenue }));

    // 4. Sales by Salesperson
    const salespersonStats = await prisma.order.groupBy({
      by: ['sales_person_name'],
      where: {
        createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth }
      },
      _sum: { final_price: true },
      _count: { id: true }
    });

    res.json({
      totalRevenue,
      totalOrders,
      activeOrdersCount,
      categoryStats: categoryStats.map(c => ({ name: c.category || 'Бусад', value: c._count.id, revenue: c._sum.final_price || 0 })),
      trend,
      salespersonStats: salespersonStats.map(s => ({ name: s.sales_person_name || 'Тодорхойгүй', revenue: s._sum.final_price || 0, count: s._count.id }))
    });

  } catch (error) {
    console.error('Admin Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export const getSalesAnalytics = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Sales for this user this month
    const myOrders = await prisma.order.findMany({
      where: {
        sales_person_id: user.id,
        createdAt: { gte: firstDayOfMonth }
      }
    });

    const myRevenue = myOrders.reduce((sum, order) => sum + (order.final_price || 0), 0);
    const myTotalOrders = myOrders.length;
    
    const myActiveOrders = await prisma.order.count({
      where: {
        sales_person_id: user.id,
        current_status: { notIn: ['Бэлэн', 'Олгосон'] }
      }
    });

    res.json({
      myRevenue,
      myTotalOrders,
      myActiveOrders
    });

  } catch (error) {
    console.error('Sales Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
