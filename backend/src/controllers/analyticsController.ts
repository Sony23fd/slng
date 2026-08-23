import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    const { period } = req.query;
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    if (period === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // 1. Total revenue & orders this period
    const currentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    const totalRevenue = currentOrders.reduce((sum, order) => sum + (order.final_price || 0), 0);
    const totalOrders = currentOrders.length;
    
    // Active orders (not Бэлэн or Олгосон)
    const activeOrdersCount = await prisma.order.count({
      where: {
        current_status: { notIn: ['Бэлэн', 'Олгосон', 'Цуцлагдсан'] }
      }
    });

    // 2. Sales by Category (Pie chart)
    const categoryStats = await prisma.order.groupBy({
      by: ['category'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: { id: true },
      _sum: { final_price: true }
    });

    // 3. Sales Trend (Last 7 days Line chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentTrendOrders = await prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, final_price: true }
    });

    const trendMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      trendMap.set(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 0);
    }

    recentTrendOrders.forEach(o => {
      const dateStr = o.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (trendMap.has(dateStr)) {
        trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + (o.final_price || 0));
      }
    });

    const trend = Array.from(trendMap.entries()).map(([date, revenue]) => ({ date, revenue }));

    // 4. Sales by Salesperson
    const salespersonStats = await prisma.order.groupBy({
      by: ['sales_person_name'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _sum: { final_price: true },
      _count: { id: true }
    });

    // 5. Recent Orders (Top 10)
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, order_number: true, customer_name: true, product_name: true, total_qty: true, final_price: true, current_status: true, createdAt: true }
    });

    // 6. Top Customers
    const customerStats = await prisma.order.groupBy({
      by: ['customer_name'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _sum: { final_price: true }
    });
    const topCustomers = customerStats
      .filter(c => c.customer_name && c._sum.final_price)
      .sort((a, b) => (b._sum.final_price || 0) - (a._sum.final_price || 0))
      .slice(0, 5)
      .map(c => ({ name: c.customer_name, revenue: c._sum.final_price || 0 }));

    res.json({
      totalRevenue,
      totalOrders,
      activeOrdersCount,
      categoryStats: categoryStats.map(c => ({ name: c.category || 'Бусад', value: c._count.id, revenue: c._sum.final_price || 0 })),
      trend,
      salespersonStats: salespersonStats.map(s => ({ name: s.sales_person_name || 'Тодорхойгүй', revenue: s._sum.final_price || 0, count: s._count.id })),
      recentOrders,
      topCustomers
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
        current_status: { notIn: ['Бэлэн', 'Олгосон', 'Цуцлагдсан'] }
      }
    });

    // Sales Trend (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentTrendOrders = await prisma.order.findMany({
      where: { sales_person_id: user.id, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, final_price: true }
    });

    const trendMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      trendMap.set(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 0);
    }

    recentTrendOrders.forEach(o => {
      const dateStr = o.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (trendMap.has(dateStr)) {
        trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + (o.final_price || 0));
      }
    });

    const myTrend = Array.from(trendMap.entries()).map(([date, revenue]) => ({ date, revenue }));

    // Recent Orders (Top 5)
    const myRecentOrders = await prisma.order.findMany({
      where: { sales_person_id: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, order_number: true, customer_name: true, product_name: true, total_qty: true, final_price: true, current_status: true, createdAt: true }
    });

    res.json({
      myRevenue,
      myTotalOrders,
      myActiveOrders,
      myTrend,
      myRecentOrders
    });

  } catch (error) {
    console.error('Sales Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

