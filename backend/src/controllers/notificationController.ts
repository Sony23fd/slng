import { Request, Response } from 'express';
import prisma from '../db';

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: 'desc' },
      take: 15 // Limit to 15 latest
    });
    res.json(notifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.notification.updateMany({
      where: { 
        id: parseInt(id as string, 10),
        user_id: userId
      },
      data: { is_read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.notification.updateMany({
      where: { 
        user_id: userId,
        is_read: false
      },
      data: { is_read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Mark All Read Error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};
